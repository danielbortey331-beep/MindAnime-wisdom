import { Brain, Flame, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { SubscriptionStatus } from '@/lib/subscription';

interface HeaderProps {
  onLogoClick: () => void;
  onSubmitClick: () => void;
  streakCount: number;
  onSignInClick: () => void;
  onUpgradeClick: () => void;
  subStatus: SubscriptionStatus | null;
}

export function Header({
  onLogoClick,
  onSubmitClick,
  streakCount,
  onSignInClick,
  onUpgradeClick,
  subStatus,
}: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/60 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <button
          onClick={onLogoClick}
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-600/20">
            <Brain className="h-5 w-5 text-ink-950" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight text-ink-100">
              MindAnime
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
              Wisdom Feed
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 sm:flex">
            <a
              href="#feed"
              className="text-sm font-medium text-ink-300 transition-colors hover:text-gold-400"
            >
              Feed
            </a>
            <a
              href="#streak"
              className="text-sm font-medium text-ink-300 transition-colors hover:text-gold-400"
            >
              Streak
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-ink-300 transition-colors hover:text-gold-400"
            >
              About
            </a>
          </nav>

          {/* Streak badge */}
          {streakCount > 0 && (
            <a
              href="#streak"
              className="flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400 transition-all hover:bg-gold-500/20"
            >
              <Flame className="h-3.5 w-3.5" strokeWidth={2.5} />
              {streakCount}
            </a>
          )}

          {/* Auth area */}
          {user ? (
            <div className="flex items-center gap-2">
              {subStatus && !subStatus.isPro && (
                <button
                  onClick={onUpgradeClick}
                  className="hidden items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400 transition-all hover:bg-gold-500/20 sm:flex"
                >
                  Go Pro
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 bg-ink-850">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-ink-400" />
                  )}
                </div>
                <span className="hidden text-sm font-medium text-ink-200 sm:inline">
                  {profile?.username ?? 'User'}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1.5 text-xs font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/60 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:border-gold-500/40 hover:text-gold-400"
            >
              Sign in
            </button>
          )}

          {user && (
            <button
              onClick={onSubmitClick}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30 sm:px-5"
            >
              Share Perspective
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
