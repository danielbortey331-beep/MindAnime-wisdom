import { Crown, X, Sparkles } from 'lucide-react';
import type { SubscriptionStatus } from '@/lib/subscription';

interface UpgradeBannerProps {
  status: SubscriptionStatus;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function UpgradeBanner({ status, onUpgrade, onDismiss }: UpgradeBannerProps) {
  if (!status.isTrial || status.daysRemaining <= 0) return null;

  return (
    <div className="relative mx-auto max-w-6xl px-5 pt-6 sm:px-8">
      <div className="flex items-center gap-4 rounded-2xl border border-gold-500/30 bg-gradient-to-r from-gold-500/10 via-gold-500/5 to-transparent px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-500/20">
          <Sparkles className="h-5 w-5 text-gold-400" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-100">
            Your free trial ends in {status.daysRemaining} {status.daysRemaining === 1 ? 'day' : 'days'}
          </p>
          <p className="text-xs text-ink-400">
            Upgrade to Pro for $5/month to keep full access.
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2 text-xs font-semibold text-ink-950 shadow-md shadow-gold-600/20 transition-all hover:shadow-gold-500/30"
        >
          <Crown className="h-3.5 w-3.5" />
          Upgrade
        </button>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-ink-500 transition-colors hover:text-ink-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
