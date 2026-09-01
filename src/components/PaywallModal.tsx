import { X, Crown, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface PaywallModalProps {
  onClose: () => void;
}

export function PaywallModal({ onClose }: PaywallModalProps) {
  const { user, refreshProfile } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError(null);

    if (!user) {
      setError('Please sign in first.');
      setUpgrading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'pro' })
      .eq('id', user.id);

    setUpgrading(false);

    if (updateError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    await refreshProfile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 backdrop-blur-md animate-fade-in px-4">
      <div className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl border border-gold-500/30 bg-ink-900/90 shadow-2xl shadow-gold-600/10 sm:max-w-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-ink-500 transition-colors hover:text-ink-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with glow */}
        <div className="relative overflow-hidden px-6 pb-6 pt-10 text-center sm:px-8">
          <div className="absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-gold-500/10 blur-[60px]" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-600/30">
              <Crown className="h-8 w-8 text-ink-950" strokeWidth={2.5} />
            </div>
            <h2 className="mb-2 font-serif text-2xl font-semibold text-ink-100">
              Unlock MindAnime Pro
            </h2>
            <p className="text-sm text-ink-400">
              Your free trial has ended. Subscribe to keep posting, commenting, and reading full insights.
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="mx-6 mb-6 rounded-2xl border border-ink-800 bg-ink-850/50 p-6 text-center sm:mx-8">
          <div className="flex items-end justify-center gap-1">
            <span className="font-serif text-5xl font-bold text-gold-400">$5</span>
            <span className="mb-1.5 text-sm text-ink-400">/month</span>
          </div>
          <p className="mt-1 text-xs text-ink-500">Cancel anytime</p>
        </div>

        {/* Features */}
        <div className="mx-6 mb-6 space-y-3 sm:mx-8">
          {[
            'Unlimited posting and commenting',
            'Full access to all curated insights',
            'Upvote and engage with the community',
            'Track your daily wisdom streak',
            'No ads, no interruptions',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20">
                <Check className="h-3 w-3 text-gold-400" strokeWidth={3} />
              </div>
              <span className="text-sm text-ink-200">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 sm:px-8">
          {error && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3.5 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30 disabled:opacity-50"
          >
            {upgrading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="mt-3 w-full text-center text-sm text-ink-500 transition-colors hover:text-ink-300"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
