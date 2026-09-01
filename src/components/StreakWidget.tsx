import { Flame, Trophy, Calendar } from 'lucide-react';
import type { StreakData } from '@/lib/streak';
import { getStreakStatus, getWeeklyActivity } from '@/lib/streak';

interface StreakWidgetProps {
  streak: StreakData;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakWidget({ streak }: StreakWidgetProps) {
  const status = getStreakStatus(streak);
  const weekly = getWeeklyActivity(streak);
  const todayIndex = 6;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900/80 to-ink-850/60 p-5 sm:p-6">
      {/* Glow */}
      {streak.current_streak > 0 && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-500/10 blur-[40px]" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                streak.current_streak > 0
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-600/20'
                  : 'bg-ink-800'
              }`}
            >
              <Flame
                className={`h-6 w-6 ${streak.current_streak > 0 ? 'text-ink-950' : 'text-ink-500'}`}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-ink-100">
                {status.label}
              </p>
              <p className="text-xs text-ink-400">{status.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-3xl font-bold text-gold-400">
              {streak.current_streak}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-500">days</p>
          </div>
        </div>

        {/* Weekly activity dots */}
        <div className="mb-4 flex items-center justify-between gap-1.5">
          {weekly.map((active, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-ink-500">{DAY_LABELS[i]}</span>
              <div
                className={`h-8 w-full rounded-lg transition-all ${
                  active
                    ? 'bg-gradient-to-b from-gold-400 to-gold-600'
                    : i === todayIndex
                      ? 'border border-dashed border-ink-600 bg-ink-800/30'
                      : 'bg-ink-800/40'
                }`}
              >
                {active && (
                  <div className="flex h-full items-center justify-center">
                    <Flame className="h-3.5 w-3.5 text-ink-950" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 border-t border-ink-800 pt-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold-500/70" />
            <div>
              <p className="text-sm font-semibold text-ink-200">{streak.best_streak}</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">Best streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sage-500/70" />
            <div>
              <p className="text-sm font-semibold text-ink-200">{streak.total_days_visited}</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">Total visits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
