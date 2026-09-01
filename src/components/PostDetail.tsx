import { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, Quote as QuoteIcon, ArrowUp, MessageCircle, Loader2, Send, Lock, Globe, ListChecks, Wrench } from 'lucide-react';
import { supabase, type Post, type Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/subscription';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onRequireAuth: () => void;
  onRequireUpgrade: () => void;
}

interface CommentWithVotes extends Comment {
  vote_count: number;
  has_voted: boolean;
}

export function PostDetail({ post, onClose, onRequireAuth, onRequireUpgrade }: PostDetailProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentWithVotes[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postVotes, setPostVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const subStatus = profile ? getSubscriptionStatus(profile) : null;
  const isLocked = subStatus?.level === 'locked' && !subStatus?.isAdmin;

  const fetchComments = useCallback(async () => {
    const { data: commentData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false });

    if (!commentData) return;

    const commentIds = (commentData as Comment[]).map((c) => c.id);
    if (commentIds.length === 0) {
      setComments([]);
      return;
    }

    const { data: votes } = await supabase
      .from('comment_votes')
      .select('comment_id, user_id')
      .in('comment_id', commentIds);

    const voteMap = new Map<string, { count: number; voted: boolean }>();
    (votes ?? []).forEach((v: { comment_id: string; user_id: string | null }) => {
      const existing = voteMap.get(v.comment_id) ?? { count: 0, voted: false };
      existing.count += 1;
      if (v.user_id === user?.id) existing.voted = true;
      voteMap.set(v.comment_id, existing);
    });

    setComments(
      (commentData as Comment[]).map((c) => ({
        ...c,
        vote_count: voteMap.get(c.id)?.count ?? 0,
        has_voted: voteMap.get(c.id)?.voted ?? false,
      })),
    );
  }, [post.id, user?.id]);

  const fetchPostVotes = useCallback(async () => {
    const { count } = await supabase
      .from('post_votes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    setPostVotes(count ?? 0);

    if (user) {
      const { data: myVote } = await supabase
        .from('post_votes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      setHasVoted(!!myVote);
    }
  }, [post.id, user]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setLoadingComments(true);
    Promise.all([fetchComments(), fetchPostVotes()]).finally(() =>
      setLoadingComments(false),
    );

    const channel = supabase
      .channel(`post-${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
        () => fetchComments(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comment_votes' },
        () => fetchComments(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_votes', filter: `post_id=eq.${post.id}` },
        () => fetchPostVotes(),
      )
      .subscribe();

    return () => {
      document.body.style.overflow = '';
      supabase.removeChannel(channel);
    };
  }, [post.id, fetchComments, fetchPostVotes]);

  const handlePostVote = async () => {
    if (!user) { onRequireAuth(); return; }
    if (isLocked) { onRequireUpgrade(); return; }
    if (voting) return;
    setVoting(true);

    if (hasVoted) {
      await supabase.from('post_votes').delete().eq('post_id', post.id).eq('user_id', user.id);
      setPostVotes((p) => Math.max(0, p - 1));
      setHasVoted(false);
    } else {
      await supabase.from('post_votes').insert({ post_id: post.id, user_id: user.id });
      setPostVotes((p) => p + 1);
      setHasVoted(true);
    }
    setVoting(false);
  };

  const handleCommentVote = async (commentId: string, currentlyVoted: boolean) => {
    if (!user) { onRequireAuth(); return; }
    if (isLocked) { onRequireUpgrade(); return; }

    if (currentlyVoted) {
      await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, vote_count: Math.max(0, c.vote_count - 1), has_voted: false } : c,
        ),
      );
    } else {
      await supabase.from('comment_votes').insert({ comment_id: commentId, user_id: user.id });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, vote_count: c.vote_count + 1, has_voted: true } : c,
        ),
      );
    }
  };

  const handleSubmitComment = async () => {
    if (!user) { onRequireAuth(); return; }
    if (isLocked) { onRequireUpgrade(); return; }
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const { data } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: user.id,
        author_name: profile?.username ?? 'Anonymous',
        content: newComment.trim(),
      })
      .select('*')
      .single();

    if (data) {
      setNewComment('');
      setComments((prev) => [
        { ...(data as Comment), vote_count: 0, has_voted: false },
        ...prev,
      ]);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 backdrop-blur-md animate-fade-in">
      <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Close bar */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:border-ink-600 hover:text-ink-100"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          {/* Article */}
          <article className="animate-fade-in-up overflow-hidden rounded-3xl border border-ink-800 bg-ink-900/80 shadow-2xl shadow-black/50">
            {/* Hero image */}
            {post.image_url && (
              <div className="relative h-56 overflow-hidden sm:h-80">
                <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-3 sm:left-10">
                  <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-ink-950/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-gold-400 backdrop-blur-sm">
                    {post.category}
                  </span>
                  {!post.is_curated && (
                    <span className="inline-flex items-center rounded-full border border-sage-600/30 bg-ink-950/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-sage-400 backdrop-blur-sm">
                      Community
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 sm:p-10 md:p-14">
              {!post.image_url && (
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-gold-400">
                    {post.category}
                  </span>
                  {!post.is_curated && (
                    <span className="inline-flex items-center rounded-full border border-sage-600/30 bg-sage-600/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-sage-400">
                      Community
                    </span>
                  )}
                </div>
              )}

              <h1 className="mb-4 font-serif text-2xl font-semibold leading-tight text-ink-100 text-balance sm:text-3xl md:text-4xl">
                {post.title}
              </h1>

              <p className="mb-6 text-base leading-relaxed text-ink-300 sm:text-lg">
                {post.excerpt}
              </p>

              {/* Vote bar */}
              <div className="mb-8 flex items-center gap-4 border-y border-ink-800 py-4">
                <button
                  onClick={handlePostVote}
                  disabled={voting}
                  className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    hasVoted
                      ? 'border-gold-500/50 bg-gold-500/15 text-gold-400'
                      : 'border-ink-700 bg-ink-850 text-ink-300 hover:border-gold-500/40 hover:text-gold-400'
                  }`}
                >
                  <ArrowUp
                    className={`h-4 w-4 transition-transform ${hasVoted ? 'scale-110' : 'group-hover:scale-110'}`}
                    strokeWidth={2.5}
                  />
                  {postVotes}
                </button>
                <span className="flex items-center gap-1.5 text-sm text-ink-400">
                  <MessageCircle className="h-4 w-4" />
                  {comments.length} discussions
                </span>
                <span className="ml-auto text-xs text-ink-500">
                  by {post.author_name}
                </span>
              </div>

              {/* Source */}
              {post.source_title && (
                <div className="mb-8 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-ink-400" />
                  <span className="text-sm text-ink-300">
                    <span className="font-medium text-ink-200">{post.source_author}</span>
                    {post.source_author && post.source_title && ' · '}
                    <span className="italic">{post.source_title}</span>
                  </span>
                </div>
              )}

              {/* Body — locked content */}
              {isLocked ? (
                <div className="mb-10 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-8 text-center">
                  <Lock className="mx-auto mb-3 h-8 w-8 text-gold-400" strokeWidth={2} />
                  <h3 className="mb-2 font-serif text-lg font-semibold text-ink-100">
                    Your free trial has ended
                  </h3>
                  <p className="mb-4 text-sm text-ink-400">
                    Subscribe to MindAnime Pro to unlock full insights, commenting, and community engagement.
                  </p>
                  <button
                    onClick={onRequireUpgrade}
                    className="rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-2.5 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30"
                  >
                    Upgrade to Pro — $5/month
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {post.body.map((section, i) => {
                    if (section.type === 'heading') {
                      return (
                        <h3 key={i} className="pt-2 font-serif text-lg font-semibold text-gold-400 sm:text-xl">
                          {section.content}
                        </h3>
                      );
                    }
                    if (section.type === 'takeaway') {
                      return (
                        <div key={i} className="rounded-2xl border border-sage-600/30 bg-sage-600/10 p-5 sm:p-6">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-500/20">
                              <QuoteIcon className="h-3 w-3 text-sage-400" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-sage-400">
                              Key Takeaway
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-ink-100 sm:text-base">
                            {section.content}
                          </p>
                        </div>
                      );
                    }
                    if (section.type === 'application') {
                      return (
                        <div key={i} className="rounded-2xl border border-gold-500/20 bg-gold-500/5 p-5 sm:p-6">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/20">
                              <Wrench className="h-3 w-3 text-gold-400" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                              Real-World Application
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-ink-200 sm:text-base">
                            {section.content}
                          </p>
                        </div>
                      );
                    }
                    if (section.type === 'steps') {
                      return (
                        <div key={i} className="rounded-2xl border border-ink-700 bg-ink-850/40 p-5 sm:p-6">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-700">
                              <ListChecks className="h-3 w-3 text-ink-200" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-ink-300">
                              Actionable Steps
                            </span>
                          </div>
                          <ol className="space-y-3">
                            {section.content.map((step, si) => (
                              <li key={si} className="flex gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-xs font-bold text-gold-400">
                                  {si + 1}
                                </span>
                                <span className="text-sm leading-relaxed text-ink-200 pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      );
                    }
                    if (section.type === 'resources') {
                      return (
                        <div key={i} className="rounded-2xl border border-sage-600/20 bg-sage-600/5 p-5 sm:p-6">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-500/20">
                              <Globe className="h-3 w-3 text-sage-400" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-sage-400">
                              Free Knowledge & Resources
                            </span>
                          </div>
                          <div className="space-y-2">
                            {section.content.map((resource, ri) => (
                              <a
                                key={ri}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900/40 px-4 py-2.5 text-sm text-ink-200 transition-all hover:border-sage-600/40 hover:text-sage-400"
                              >
                                <Globe className="h-3.5 w-3.5 flex-shrink-0 text-sage-400/70" />
                                {resource.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-[15px] leading-[1.75] text-ink-200 sm:text-base sm:leading-[1.8]">
                        {section.content}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Discussion section */}
              <div className="mt-10 border-t border-ink-800 pt-8">
                <h3 className="mb-1 font-serif text-xl font-semibold text-ink-100">Discussion</h3>
                <p className="mb-6 text-sm text-ink-400">
                  Share how this principle applied to your life, work, or education.
                </p>

                {/* Comment form */}
                {user && !isLocked ? (
                  <div className="mb-6 space-y-3 rounded-2xl border border-ink-800 bg-ink-850/50 p-5">
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="font-medium text-gold-400">{profile?.username ?? 'You'}</span>
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your perspective — how did this apply to your life?"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || submitting}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2 text-sm font-semibold text-ink-950 transition-all hover:shadow-gold-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Post
                      </button>
                    </div>
                  </div>
                ) : !user ? (
                  <div className="mb-6 rounded-2xl border border-ink-800 bg-ink-850/50 p-5 text-center">
                    <p className="text-sm text-ink-400 mb-3">Sign in to join the discussion.</p>
                    <button
                      onClick={onRequireAuth}
                      className="rounded-full border border-gold-500/40 bg-gold-500/10 px-5 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <div className="mb-6 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5 text-center">
                    <p className="text-sm text-ink-400 mb-3">Upgrade to Pro to continue commenting.</p>
                    <button
                      onClick={onRequireUpgrade}
                      className="rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 transition-all hover:shadow-gold-500/30"
                    >
                      Upgrade — $5/month
                    </button>
                  </div>
                )}

                {/* Comments list */}
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-400">
                    No discussions yet. Be the first to share.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="rounded-2xl border border-ink-800 bg-ink-850/30 p-4 sm:p-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gold-400">{comment.author_name}</span>
                          <span className="text-xs text-ink-500">
                            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="mb-3 text-sm leading-relaxed text-ink-200">{comment.content}</p>
                        <button
                          onClick={() => handleCommentVote(comment.id, comment.has_voted)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            comment.has_voted ? 'text-gold-400' : 'text-ink-400 hover:text-gold-400'
                          }`}
                        >
                          <ArrowUp className={`h-3.5 w-3.5 ${comment.has_voted ? 'scale-110' : ''}`} strokeWidth={2.5} />
                          {comment.vote_count}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
