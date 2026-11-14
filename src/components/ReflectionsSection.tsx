import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useLiveReflections } from '@/hooks/useLiveReflections';

interface ReflectionsSectionProps {
  postId: string;
  isLocked: boolean;
  onRequireAuth: () => void;
  onRequireUpgrade: () => void;
}

export function ReflectionsSection({ postId, isLocked, onRequireAuth, onRequireUpgrade }: ReflectionsSectionProps) {
  const { user, profile } = useAuth();
  const {
    reflections,
    loading,
    loadError,
    presenceCount,
    incomingCount,
    markSeen,
    submitReflection,
    toggleVote,
  } = useLiveReflections(postId);

  const [draft, setDraft] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [listTopVisible, setListTopVisible] = useState(true);
  const listTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = listTopRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setListTopVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (listTopVisible && incomingCount > 0) markSeen();
  }, [listTopVisible, incomingCount, markSeen]);

  const jumpToNewest = () => {
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    markSeen();
  };

  const handlePost = async () => {
    if (!user) { onRequireAuth(); return; }
    if (isLocked) { onRequireUpgrade(); return; }
    const content = draft.trim();
    if (!content) return;

    setDraft('');
    setSubmitError(null);
    const error = await submitReflection(content);
    if (error) {
      setDraft((current) => current || content);
      setSubmitError(error);
    }
  };

  const handleVote = (commentId: string) => {
    if (!user) { onRequireAuth(); return; }
    if (isLocked) { onRequireUpgrade(); return; }
    void toggleVote(commentId);
  };

  return (
    <section className="mt-10 border-t border-ink-800 pt-8">
      <h3 className="mb-1 font-serif text-xl font-semibold text-ink-100">Discussion</h3>
      <p className="mb-2 text-sm text-ink-400">
        Share how this principle applied to your life, work, or education.
      </p>
      {presenceCount >= 2 && (
        <p className="mb-6 flex items-center gap-2 text-xs text-ink-400">
          <span className="h-2 w-2 rounded-full bg-sage-400 animate-pulse" aria-hidden="true" />
          {presenceCount} minds reflecting now
        </p>
      )}

      {user && !isLocked ? (
        <div className="mb-6 space-y-3 rounded-2xl border border-ink-800 bg-ink-850/50 p-5">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <span className="font-medium text-gold-400">{profile?.username ?? 'You'}</span>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share your perspective — how did this apply to your life?"
            rows={3}
            className="w-full resize-none rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
          />
          {submitError && <p className="text-xs text-gold-400">{submitError}</p>}
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={!draft.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2 text-sm font-semibold text-ink-950 transition-all active:scale-95 hover:shadow-gold-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Post
            </button>
          </div>
        </div>
      ) : !user ? (
        <div className="mb-6 rounded-2xl border border-ink-800 bg-ink-850/50 p-5 text-center">
          <p className="mb-3 text-sm text-ink-400">Sign in to join the discussion.</p>
          <button
            onClick={onRequireAuth}
            className="rounded-full border border-gold-500/40 bg-gold-500/10 px-5 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5 text-center">
          <p className="mb-3 text-sm text-ink-400">Upgrade to Pro to continue commenting.</p>
          <button
            onClick={onRequireUpgrade}
            className="rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 transition-all hover:shadow-gold-500/30"
          >
            Upgrade — $5/month
          </button>
        </div>
      )}

      <div ref={listTopRef} className="h-px" aria-hidden="true" />

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
        </div>
      ) : loadError ? (
        <p className="py-8 text-center text-sm text-gold-400">{loadError}</p>
      ) : reflections.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-400">
          No discussions yet. Be the first to share.
        </p>
      ) : (
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <div
              key={reflection.id}
              className={`rounded-2xl border border-ink-800 bg-ink-850/30 p-4 transition-opacity duration-300 sm:p-5 ${
                reflection.pending ? 'opacity-60' : ''
              } ${reflection.fresh ? 'animate-fade-in-up' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gold-400">{reflection.author_name}</span>
                <span className="text-xs text-ink-500">
                  {new Date(reflection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-ink-200">{reflection.content}</p>
              <button
                type="button"
                disabled={reflection.pending}
                onClick={() => handleVote(reflection.id)}
                aria-pressed={reflection.has_voted}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:cursor-default ${
                  reflection.has_voted ? 'text-gold-400' : 'text-ink-400 hover:text-gold-400'
                }`}
              >
                <ArrowUp
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${reflection.has_voted ? 'scale-110' : ''}`}
                  strokeWidth={2.5}
                />
                {reflection.vote_count}
              </button>
            </div>
          ))}
        </div>
      )}

      {incomingCount > 0 && !listTopVisible &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
            <button
              type="button"
              onClick={jumpToNewest}
              className="pointer-events-auto flex animate-fade-in-up items-center gap-2 rounded-full border border-gold-500/40 bg-ink-900/95 px-4 py-2 text-sm font-medium text-gold-400 shadow-xl shadow-black/40 backdrop-blur-md transition-transform active:scale-95"
            >
              <ArrowUp className="h-4 w-4" />
              New reflection posted
            </button>
          </div>,
          document.body,
        )}
    </section>
  );
}
