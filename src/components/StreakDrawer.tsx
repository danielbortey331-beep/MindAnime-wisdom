import { Check, Flame, X, Zap } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { STREAK_MILESTONES } from '@/lib/streak';

interface StreakDrawerProps {
  onClose: () => void;
}

export function StreakDrawer({ onClose }: StreakDrawerProps) {
  const { streak, totalXp, todayXp, dailyGoal, weekDays } = useGamification();
  const progress = Math.min(100, Math.round((todayXp / dailyGoal) * 100));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Streak calendar"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85dvh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl border border-ink-800 bg-ink-900 px-6 pb-8 pt-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink-100">Your streak</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-300 transition-colors hover:text-ink-100 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15">
            <Flame className="h-7 w-7 text-gold-400" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-serif text-3xl font-semibold text-gold-400">{streak}</p>
            <p className="text-xs text-ink-400">
              {streak === 1 ? 'day in a row' : 'days in a row'}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="flex items-center justify-end gap-1 text-sm font-semibold text-ink-100">
              <Zap className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.5} />
              {totalXp} XP
            </p>
            <p className="mt-1 text-xs text-ink-400">
              Today {todayXp}/{dailyGoal}
            </p>
          </div>
        </div>

        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mb-6 text-xs text-ink-500">Complete a lesson to earn XP and keep your streak alive.</p>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-400">This week</p>
        <div className="mb-8 grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => (
            <div key={day.key} className="flex flex-col items-center gap-2">
              <span className={`text-[11px] font-medium ${day.isToday ? 'text-gold-400' : 'text-ink-500'}`}>
                {day.label}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                  day.active
                    ? 'border-gold-400 bg-gold-500/20 text-gold-400 shadow-[0_0_16px_rgba(212,168,74,0.45)]'
                    : day.isToday
                      ? 'border-gold-500/50 bg-ink-850 text-ink-500'
                      : 'border-ink-700 bg-ink-850 text-ink-600'
                }`}
              >
                {day.active && <Check className="h-4 w-4" strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-400">Milestones</p>
        <div className="flex flex-wrap gap-2">
          {STREAK_MILESTONES.map((m) => {
            const achieved = streak >= m;
            return (
              <span
                key={m}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  achieved
                    ? 'border-gold-500/50 bg-gold-500/15 text-gold-400'
                    : 'border-ink-800 bg-ink-850/40 text-ink-500'
                }`}
              >
                <Flame className="h-3 w-3" strokeWidth={2.5} />
                {m} days
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
