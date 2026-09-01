import { useState, useEffect, useCallback } from 'react';
import { Sparkles, BookOpen, Lightbulb, Loader2, Users, TrendingUp, PenLine, Flame, Lock } from 'lucide-react';
import { supabase, type Post, type Comment, type Category, PREMIUM_CATEGORIES } from '@/lib/supabase';
import { registerDailyVisit, type StreakData } from '@/lib/streak';
import { useAuth } from '@/lib/auth';
import { getSubscriptionStatus, shouldShowUpgradeBanner, type SubscriptionStatus } from '@/lib/subscription';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { PostDetail } from '@/components/PostDetail';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SubmitPostModal } from '@/components/SubmitPostModal';
import { StreakWidget } from '@/components/StreakWidget';
import { MilestoneToast } from '@/components/MilestoneToast';
import { AuthModal } from '@/components/AuthModal';
import { PaywallModal } from '@/components/PaywallModal';
import { UpgradeBanner } from '@/components/UpgradeBanner';
import { WelcomeModal } from '@/components/WelcomeModal';
import { PremiumLockModal } from '@/components/PremiumLockModal';

interface FeedPost extends Post {
  vote_count: number;
  has_voted: boolean;
  comment_count: number;
}

const WELCOME_SEEN_KEY = 'mindanime-welcome-seen';
const BANNER_DISMISSED_KEY = 'mindanime-banner-dismissed';

function App() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPremiumLock, setShowPremiumLock] = useState(false);
  const [lockedCategory, setLockedCategory] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);

  const subStatus: SubscriptionStatus | null = profile ? getSubscriptionStatus(profile) : null;

  useEffect(() => {
    const result = registerDailyVisit();
    setStreak(result.data);
    if (result.newMilestone) {
      setMilestone(result.newMilestone);
    }
    if (!localStorage.getItem(WELCOME_SEEN_KEY)) {
      setShowWelcome(true);
    }
    setBannerDismissed(localStorage.getItem(BANNER_DISMISSED_KEY) === 'true');
  }, []);

  const fetchPosts = useCallback(async () => {
    const { data: postData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !postData) {
      setLoading(false);
      return;
    }

    const allPosts = postData as Post[];
    if (allPosts.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postIds = allPosts.map((p) => p.id);

    const [votesRes, commentsRes] = await Promise.all([
      supabase.from('post_votes').select('post_id').in('post_id', postIds),
      supabase.from('comments').select('post_id').in('post_id', postIds),
    ]);

    const voteCounts = new Map<string, number>();
    (votesRes.data ?? []).forEach((v: { post_id: string }) => {
      voteCounts.set(v.post_id, (voteCounts.get(v.post_id) ?? 0) + 1);
    });

    const myVotes = new Set<string>();
    if (user) {
      const { data: myVotesData } = await supabase
        .from('post_votes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', user.id);
      (myVotesData ?? []).forEach((v: { post_id: string }) => myVotes.add(v.post_id));
    }

    const commentCounts = new Map<string, number>();
    (commentsRes.data ?? []).forEach((c: { post_id: string }) => {
      commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1);
    });

    const feedPosts: FeedPost[] = allPosts.map((p) => ({
      ...p,
      vote_count: voteCounts.get(p.id) ?? 0,
      has_voted: myVotes.has(p.id),
      comment_count: commentCounts.get(p.id) ?? 0,
    }));

    setPosts(feedPosts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_votes' }, () => fetchPosts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => fetchPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const requireAuth = (): boolean => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const isAdmin = subStatus?.isAdmin ?? false;

  const requireAccess = (): boolean => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    if (subStatus && subStatus.level === 'locked' && !isAdmin) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  const handleVote = async (postId: string, currentlyVoted: boolean) => {
    if (!requireAccess()) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, has_voted: !currentlyVoted, vote_count: p.vote_count + (currentlyVoted ? -1 : 1) }
          : p,
      ),
    );

    if (currentlyVoted) {
      await supabase.from('post_votes').delete().eq('post_id', postId).eq('user_id', user!.id);
    } else {
      await supabase.from('post_votes').insert({ post_id: postId, user_id: user!.id });
    }

    fetchPosts();
  };

  const handlePostClick = (post: FeedPost) => {
    if (!isAdmin && PREMIUM_CATEGORIES.includes(post.category)) {
      setLockedCategory(post.category);
      setShowPremiumLock(true);
      return;
    }
    if (!requireAccess()) return;
    setSelectedPost(post);
  };

  const handleSubmitClick = () => {
    if (!requireAccess()) return;
    setShowSubmitModal(true);
  };

  const handleWelcomeClose = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setShowWelcome(false);
  };

  const handleBannerDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setBannerDismissed(true);
  };

  const filteredPosts =
    activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  const sortedPosts = [...filteredPosts].sort((a, b) =>
    sortBy === 'top' ? b.vote_count - a.vote_count : 0,
  );

  const totalVotes = posts.reduce((sum, p) => sum + p.vote_count, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comment_count, 0);

  const showBanner = !isAdmin && subStatus && shouldShowUpgradeBanner(subStatus) && !bannerDismissed;

  return (
    <div className="min-h-screen bg-ink-950">
      <Header
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSubmitClick={handleSubmitClick}
        streakCount={streak?.current_streak ?? 0}
        onSignInClick={() => setShowAuthModal(true)}
        onUpgradeClick={() => setShowPaywall(true)}
        subStatus={subStatus}
      />

      {milestone !== null && (
        <MilestoneToast milestone={milestone} onClose={() => setMilestone(null)} />
      )}

      {showBanner && subStatus && (
        <UpgradeBanner
          status={subStatus}
          onUpgrade={() => setShowPaywall(true)}
          onDismiss={handleBannerDismiss}
        />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-800/60">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7677345/pexels-photo-7677345.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=1"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/85 to-ink-950" />
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gold-500/5 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/60 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-ink-300">
                Community Wisdom Feed
              </span>
            </div>

            <h1 className="mb-6 font-serif text-4xl font-semibold leading-[1.1] text-ink-100 text-balance sm:text-5xl md:text-6xl">
              Where ideas sharpen minds.
            </h1>

            <p className="mb-10 text-base leading-relaxed text-ink-300 text-pretty sm:text-lg md:text-xl">
              Curated and community-driven insights from philosophy, psychology, power, and the
              great thinkers — paired with high-aesthetic anime visuals. Discuss, upvote, and share
              your own perspectives.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#feed"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30"
              >
                <BookOpen className="h-4 w-4" />
                Explore the Feed
              </a>
              {user ? (
                <button
                  onClick={handleSubmitClick}
                  className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/60 px-6 py-3 text-sm font-medium text-ink-200 transition-colors hover:border-ink-600 hover:text-ink-100"
                >
                  <PenLine className="h-4 w-4 text-gold-400" />
                  Share Your Perspective
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Free Trial
                </button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 border-t border-ink-800/60 pt-8">
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold text-gold-400 sm:text-3xl">{posts.length}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-400">
                <BookOpen className="h-3 w-3" /> Insights
              </p>
            </div>
            <div className="text-center border-x border-ink-800/60">
              <p className="font-serif text-2xl font-semibold text-gold-400 sm:text-3xl">{totalVotes}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-400">
                <TrendingUp className="h-3 w-3" /> Upvotes
              </p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold text-gold-400 sm:text-3xl">{totalComments}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-400">
                <Users className="h-3 w-3" /> Discussions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed */}
      <section id="feed" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-serif text-3xl font-semibold text-ink-100 sm:text-4xl">
            The Insight Feed
          </h2>
          <p className="text-sm text-ink-400">
            Curated breakdowns and community perspectives — upvote what resonates
          </p>
        </div>

        {/* Controls */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <CategoryFilter
            active={activeCategory}
            onChange={(cat) => {
              if (!isAdmin && cat !== 'All' && PREMIUM_CATEGORIES.includes(cat)) {
                setLockedCategory(cat);
                setShowPremiumLock(true);
                return;
              }
              setActiveCategory(cat);
            }}
            isAdmin={isAdmin}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('top')}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                sortBy === 'top'
                  ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
                  : 'border-ink-800 text-ink-400 hover:text-ink-200'
              }`}
            >
              <TrendingUp className="mr-1 inline h-3 w-3" />
              Top
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                sortBy === 'new'
                  ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
                  : 'border-ink-800 text-ink-400 hover:text-ink-200'
              }`}
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-ink-400">No insights in this category yet.</p>
            {user && (
              <button
                onClick={handleSubmitClick}
                className="mt-4 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
              >
                Be the first to share
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {sortedPosts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                voteCount={post.vote_count}
                hasVoted={post.has_voted}
                commentCount={post.comment_count}
                onVote={() => handleVote(post.id, post.has_voted)}
                onClick={() => handlePostClick(post)}
                index={i}
                locked={!user || (subStatus?.level === 'locked' && !isAdmin) || (!isAdmin && PREMIUM_CATEGORIES.includes(post.category))}
              />
            ))}
          </div>
        )}
      </section>

      {/* Streak section */}
      {streak && (
        <section id="streak" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <StreakWidget streak={streak} />
            <div className="flex flex-col justify-center rounded-2xl border border-ink-800 bg-ink-900/40 p-6 sm:p-8">
              <h3 className="mb-3 font-serif text-2xl font-semibold text-ink-100">
                Your wisdom journey
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-ink-300">
                Streaks track how many days in a row you have engaged with MindAnime. Open the app
                daily to keep your streak alive — miss a day and it resets. Your streak is saved
                locally on your device, so it persists across visits.
              </p>
              <div className="flex flex-wrap gap-2">
                {[3, 7, 14, 30, 50, 100].map((m) => {
                  const claimed = streak.milestones_claimed.includes(m);
                  const achieved = streak.current_streak >= m;
                  const badgeClass = claimed
                    ? 'border-gold-500/50 bg-gold-500/15 text-gold-400'
                    : achieved
                      ? 'border-sage-600/40 bg-sage-600/10 text-sage-400'
                      : 'border-ink-800 bg-ink-850/30 text-ink-500';
                  const flameColor = claimed
                    ? 'text-gold-400'
                    : achieved
                      ? 'text-sage-400'
                      : 'text-ink-600';
                  return (
                    <div
                      key={m}
                      className={'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ' + badgeClass}
                    >
                      <Flame className={'h-3 w-3 ' + flameColor} strokeWidth={2.5} />
                      {m} days
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About section */}
      <section id="about" className="relative overflow-hidden border-y border-ink-800/60 bg-ink-900/30">
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage-500/5 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sage-600/30 bg-sage-600/10 px-4 py-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-sage-400" />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-sage-400">
                About MindAnime
              </span>
            </div>
            <h2 className="mb-4 font-serif text-3xl font-semibold text-ink-100 sm:text-4xl">
              Wisdom meets community.
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-ink-300">
              MindAnime is a community-driven wisdom feed where curated insights from the world's
              best books and thinkers meet real-world perspectives from people like you. Every post
              pairs a high-impact lesson with anime-inspired visuals, and every card opens a live
              discussion where you can share how the principle played out in your own life.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-800 bg-ink-850/40 p-6 text-center">
              <BookOpen className="mx-auto mb-3 h-8 w-8 text-gold-400" />
              <h3 className="mb-2 font-serif text-lg font-semibold text-ink-100">Curated Insights</h3>
              <p className="text-sm leading-relaxed text-ink-400">
                Actionable breakdowns from philosophy, psychology, power, and the great thinkers.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-800 bg-ink-850/40 p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-gold-400" />
              <h3 className="mb-2 font-serif text-lg font-semibold text-ink-100">Live Discussion</h3>
              <p className="text-sm leading-relaxed text-ink-400">
                Real-time comments where the community shares practical applications and stories.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-800 bg-ink-850/40 p-6 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-gold-400" />
              <h3 className="mb-2 font-serif text-lg font-semibold text-ink-100">Upvote the Best</h3>
              <p className="text-sm leading-relaxed text-ink-400">
                The most resonant ideas rise to the top. Your vote shapes what the community sees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-800/60">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-serif text-sm text-ink-400">
              MindAnime — Community wisdom for the curious mind.
            </p>
            <p className="text-xs text-ink-500">
              Curated insights + community perspectives + anime aesthetics.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onRequireAuth={() => setShowAuthModal(true)}
          onRequireUpgrade={() => setShowPaywall(true)}
        />
      )}
      {showSubmitModal && (
        <SubmitPostModal
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={fetchPosts}
        />
      )}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showPremiumLock && lockedCategory && (
        <PremiumLockModal
          category={lockedCategory}
          onClose={() => { setShowPremiumLock(false); setLockedCategory(null); }}
        />
      )}
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
    </div>
  );
}

export default App;
