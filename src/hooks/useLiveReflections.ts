import { useCallback, useEffect, useState } from 'react';
import { supabase, type Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { hapticTap } from '@/utils/feedback';

export interface Reflection extends Comment {
  vote_count: number;
  has_voted: boolean;
  pending: boolean;
  fresh: boolean;
}

interface VoteEventRow {
  comment_id?: string;
  user_id?: string | null;
}

const SAVE_ERROR = 'Your reflection could not be posted. Please try again.';

function applyVoteChange(
  reflections: Reflection[],
  commentId: string,
  voterId: string | null,
  viewerId: string | null,
  added: boolean,
): Reflection[] {
  const delta = added ? 1 : -1;
  return reflections.map((reflection) => {
    if (reflection.id !== commentId) return reflection;
    if (voterId !== null && voterId === viewerId) {
      if (reflection.has_voted === added) return reflection;
      return {
        ...reflection,
        has_voted: added,
        vote_count: Math.max(0, reflection.vote_count + delta),
      };
    }
    return { ...reflection, vote_count: Math.max(0, reflection.vote_count + delta) };
  });
}

function sortNewestFirst(items: Reflection[]): Reflection[] {
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function useLiveReflections(postId: string) {
  const { user, profile } = useAuth();
  const viewerId = user?.id ?? null;
  const viewerName = profile?.username ?? 'Anonymous';

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [presenceCount, setPresenceCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadReflections = async () => {
      setLoading(true);
      setLoadError(null);

      const { data: commentRows, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error || !commentRows) {
        setLoadError('Reflections could not be loaded.');
        setLoading(false);
        return;
      }

      const comments = commentRows as Comment[];
      const commentIds = comments.map((comment) => comment.id);
      let votes: VoteEventRow[] = [];
      if (commentIds.length > 0) {
        const { data: voteRows, error: voteError } = await supabase
          .from('comment_votes')
          .select('comment_id, user_id')
          .in('comment_id', commentIds);
        if (cancelled) return;
        if (voteError) {
          setLoadError('Reflections could not be loaded.');
          setLoading(false);
          return;
        }
        votes = (voteRows ?? []) as VoteEventRow[];
      }

      const counts = new Map<string, { count: number; voted: boolean }>();
      votes.forEach((vote) => {
        if (!vote.comment_id) return;
        const entry = counts.get(vote.comment_id) ?? { count: 0, voted: false };
        entry.count += 1;
        if (viewerId !== null && vote.user_id === viewerId) entry.voted = true;
        counts.set(vote.comment_id, entry);
      });

      const fetched: Reflection[] = comments.map((comment) => ({
        ...comment,
        vote_count: counts.get(comment.id)?.count ?? 0,
        has_voted: counts.get(comment.id)?.voted ?? false,
        pending: false,
        fresh: false,
      }));

      setReflections((prev) => {
        const fetchedIds = new Set(fetched.map((item) => item.id));
        const arrivedMeanwhile = prev.filter((item) => !fetchedIds.has(item.id));
        return sortNewestFirst([...arrivedMeanwhile, ...fetched]);
      });
      setLoading(false);
    };

    void loadReflections();

    const presenceKey = viewerId ?? crypto.randomUUID();
    const channel = supabase
      .channel(`reflections-${postId}`, { config: { presence: { key: presenceKey } } })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const row = payload.new as Comment;
          setReflections((prev) =>
            prev.some((item) => item.id === row.id)
              ? prev
              : [{ ...row, vote_count: 0, has_voted: false, pending: false, fresh: true }, ...prev],
          );
          if (row.user_id !== viewerId) setIncomingCount((count) => count + 1);
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comment_votes' },
        (payload) => {
          const row = payload.new as VoteEventRow;
          if (!row.comment_id) return;
          setReflections((prev) =>
            applyVoteChange(prev, row.comment_id as string, row.user_id ?? null, viewerId, true),
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comment_votes' },
        (payload) => {
          const row = payload.old as VoteEventRow;
          if (!row.comment_id) return;
          setReflections((prev) =>
            applyVoteChange(prev, row.comment_id as string, row.user_id ?? null, viewerId, false),
          );
        },
      )
      .on('presence', { event: 'sync' }, () => {
        setPresenceCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void channel.track({ joined_at: new Date().toISOString() });
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [postId, viewerId]);

  const submitReflection = useCallback(
    async (content: string): Promise<string | null> => {
      if (!viewerId) return 'Sign in to join the discussion.';

      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: Reflection = {
        id: tempId,
        post_id: postId,
        user_id: viewerId,
        author_name: viewerName,
        content,
        created_at: new Date().toISOString(),
        vote_count: 0,
        has_voted: false,
        pending: true,
        fresh: true,
      };
      hapticTap();
      setReflections((prev) => [optimistic, ...prev]);

      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: viewerId, author_name: viewerName, content })
        .select('*')
        .single();

      if (error || !data) {
        setReflections((prev) => prev.filter((item) => item.id !== tempId));
        return SAVE_ERROR;
      }

      const saved = data as Comment;
      setReflections((prev) => {
        const withoutTemp = prev.filter((item) => item.id !== tempId);
        if (withoutTemp.some((item) => item.id === saved.id)) return withoutTemp;
        return [
          { ...saved, vote_count: 0, has_voted: false, pending: false, fresh: true },
          ...withoutTemp,
        ];
      });
      return null;
    },
    [postId, viewerId, viewerName],
  );

  const toggleVote = useCallback(
    async (commentId: string) => {
      if (!viewerId) return;
      const current = reflections.find((item) => item.id === commentId);
      if (!current || current.pending) return;

      const adding = !current.has_voted;
      setReflections((prev) => applyVoteChange(prev, commentId, viewerId, viewerId, adding));

      const request = adding
        ? supabase.from('comment_votes').insert({ comment_id: commentId, user_id: viewerId })
        : supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', viewerId);
      const { error } = await request;
      if (error) {
        setReflections((prev) => applyVoteChange(prev, commentId, viewerId, viewerId, !adding));
      }
    },
    [reflections, viewerId],
  );

  const markSeen = useCallback(() => setIncomingCount(0), []);

  return {
    reflections,
    loading,
    loadError,
    presenceCount,
    incomingCount,
    markSeen,
    submitReflection,
    toggleVote,
  };
}
