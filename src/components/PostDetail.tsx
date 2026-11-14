import { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, Quote as QuoteIcon, ArrowUp, MessageCircle, Loader2, Send, Lock, Globe, ListChecks, Wrench, Zap, Check, Share2 } from 'lucide-react';
import { supabase, type Post, type Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/subscription';
import { XP_PER_LESSON } from '@/lib/gamification';
import { useGamification, type LessonCompletionResult } from '@/context/GamificationContext';
import { LessonCelebrationCard } from '@/components/LessonCelebrationCard';
import { ReflectionsSection } from '@/components/ReflectionsSection';
import { ShareQuoteModal } from '@/components/ShareQuoteModal';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onRequireAuth: () => void;
  onRequireUpgrade: () => void;
}

export function PostDetail({ post, onClose, onRequireAuth, onRequireUpgrade }: PostDetailProps) {
  const { user, profile } = useAuth();
  const { isLessonCompleted, completeLesson } = useGamification();
  const [celebration, setCelebration] = useState<LessonCompletionResult | null>(null);
  const [showShare, setShowShare] = useState(false);
  const lessonDone = isLessonCompleted(post.id);
  const [postVotes, setPostVotes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const subStatus = profile ? getSubscriptionStatus(profile) : null;
  const isLocked = subStatus?.level === 'locked' && !subStatus?.isAdmin;

  const loadCommentCount = useCallback(async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    setCommentCount(count ?? 0);
  }, [post.id]);

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
    void fetchPostVotes();
    void loadCommentCount();

    const channel = supabase
      .channel(`post-${post.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
        () => void loadCommentCount(),
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
  }, [post.id, fetchPostVotes, loadCommentCount]);

  const handleCompleteLesson = () => {
    const result = completeLesson(post.id);
    if (result.xpGained > 0) setCelebration(result);
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 backdrop-blur-md animate-fade-in">
      <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Close bar */}
          <div className="mb-6 flex justify-end gap-3">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-ink-900 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:border-gold-500/60 hover:text-gold-300 active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              Share Wisdom
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:border-ink-600 hover:text-ink-100"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          {/* Article */}
          <article className="animate-slide-up overflow-hidden rounded-3xl border border-ink-800 bg-ink-900/80 shadow-2xl shadow-black/50">
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
                  {commentCount} discussions
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

              {/* Lesson completion */}
              {!isLocked && (
                <div className="mb-10 flex flex-col items-center gap-4 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="text-sm font-medium text-ink-100">Finished reading?</p>
                    <p className="text-xs text-ink-400">Log this lesson to earn XP and keep your streak alive.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompleteLesson}
                    disabled={lessonDone}
                    className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 sm:w-auto ${
                      lessonDone
                        ? 'border border-sage-600/40 bg-sage-600/15 text-sage-400'
                        : 'bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 shadow-lg shadow-gold-600/20'
                    }`}
                  >
                    {lessonDone ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={3} />
                        Lesson completed
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" strokeWidth={2.5} />
                        Complete Lesson (+{XP_PER_LESSON} XP)
                      </>
                    )}
                  </button>
                </div>
              )}

              <ReflectionsSection
                postId={post.id}
                isLocked={isLocked}
                onRequireAuth={onRequireAuth}
                onRequireUpgrade={onRequireUpgrade}
              />
            </div>
          </article>
          {celebration && (
            <LessonCelebrationCard result={celebration} onContinue={onClose} />
          )}
          {showShare && (
            <ShareQuoteModal
              quote={post.title}
              title={post.title}
              category={post.category}
              onClose={() => setShowShare(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
