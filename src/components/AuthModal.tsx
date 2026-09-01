import { useState } from 'react';
import { X, Mail, Lock, Loader2, Brain } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    const result =
      mode === 'signup'
        ? await signUp(email.trim(), password, username.trim() || undefined)
        : await signIn(email.trim(), password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 backdrop-blur-md animate-fade-in px-4">
      <div className="relative w-full max-w-md animate-fade-in-up rounded-3xl border border-ink-800 bg-ink-900/90 p-6 shadow-2xl shadow-black/50 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-500 transition-colors hover:text-ink-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-600/20">
            <Brain className="h-6 w-6 text-ink-950" strokeWidth={2.5} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-ink-100">
            {mode === 'signup' ? 'Join MindAnime' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            {mode === 'signup'
              ? 'Start your 3-day free trial. No card required.'
              : 'Sign in to continue your wisdom journey.'}
          </p>
        </div>

        {/* Email/Password form */}
        <div className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. StoicSeeker"
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 py-2.5 pl-10 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 py-2.5 pl-10 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            mode === 'signup' ? 'Create account' : 'Sign in'
          )}
        </button>

        <p className="mt-4 text-center text-sm text-ink-400">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
            }}
            className="font-medium text-gold-400 transition-colors hover:text-gold-500"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
