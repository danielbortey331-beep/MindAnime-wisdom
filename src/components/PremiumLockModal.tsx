import { useState } from 'react';
import { X, Lock, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PremiumLockModalProps {
  category: string;
  onClose: () => void;
}

export function PremiumLockModal({ category, onClose }: PremiumLockModalProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinWaitlist = async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({ email: email.trim() });

    setSubmitting(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setSubmitted(true);
        return;
      }
      setError('Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 backdrop-blur-md animate-fade-in">
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
        <div className="mx-auto max-w-md w-full">
          <div className="mb-4 flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:border-ink-600 hover:text-ink-100"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="animate-fade-in-up rounded-3xl border border-ink-800 bg-ink-900/80 p-8 shadow-2xl shadow-black/50 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10">
              <Lock className="h-7 w-7 text-gold-400" strokeWidth={2} />
            </div>

            <h2 className="mb-2 font-serif text-2xl font-semibold text-ink-100">
              Premium Feature — Access Restricted
            </h2>

            <p className="mb-1 text-sm text-ink-300">
              <span className="font-medium text-gold-400">{category}</span> is part of MindAnime Premium.
            </p>
            <p className="mb-6 text-sm text-ink-400">
              We are finalizing payment integration. Join the beta waitlist and you will get early access
              as soon as it launches.
            </p>

            {submitted ? (
              <div className="rounded-2xl border border-sage-600/30 bg-sage-600/10 p-5">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-sage-400" />
                <p className="text-sm font-medium text-sage-400">You are on the list!</p>
                <p className="mt-1 text-xs text-ink-400">
                  We will notify you at <span className="text-ink-200">{email.trim()}</span> when premium access opens.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinWaitlist()}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-ink-700 bg-ink-900/60 py-3 pl-10 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
                <button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || submitting}
                  className="w-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Joining...
                    </span>
                  ) : (
                    'Join Beta Waitlist'
                  )}
                </button>
              </div>
            )}

            <p className="mt-5 text-xs text-ink-500">
              General wisdom content remains free. Premium categories unlock after launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
