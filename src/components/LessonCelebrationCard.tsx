import { ArrowRight, Flame, Zap } from 'lucide-react';
import { useGamification, type LessonCompletionResult } from '@/context/GamificationContext';
import { SenseiMascot } from '@/components/SenseiMascot';

interface LessonCelebrationCardProps {
  result: LessonCompletionResult;
  onContinue: () => void;
}

const CONFETTI_COLORS = ['#e8c87a', '#d4a84a', '#7fb88f', '#f5efe0', '#e0a040'];

const CONFETTI_PIECES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 47) % 100,
  delay: (i % 6) * 0.08,
  duration: 1.4 + (i % 4) * 0.25,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

interface StatProps {
  icon: typeof Zap;
  label: string;
  value: string;
}

function Stat({ icon: Icon, label, value }: StatProps) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-850/60 p-4 text-left">
      <p className="mb-1 flex items-center gap-1.5 text-xs text-ink-400">
        <Icon className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.5} />
        {label}
      </p>
      <p className="font-serif text-xl font-semibold text-gold-400">{value}</p>
    </div>
  );
}

export function LessonCelebrationCard({ result, onContinue }: LessonCelebrationCardProps) {
  const { todayXp, dailyGoal, goalMet } = useGamification();
  const progress = Math.min(100, Math.round((todayXp / dailyGoal) * 100));

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lesson complete"
        className="relative w-full max-w-md animate-slide-up overflow-hidden rounded-t-3xl border border-gold-500/30 bg-ink-900 px-6 pb-8 pt-8 shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
          {CONFETTI_PIECES.map((piece, i) => (
            <span
              key={i}
              className="absolute top-0 h-2 w-1.5 animate-confetti rounded-sm"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                backgroundColor: piece.color,
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-2 flex justify-center">
            <SenseiMascot
              mood={goalMet ? 'zen' : 'celebrating'}
              message={
                goalMet
                  ? 'Daily goal reached. Your mind sharpens with every lesson.'
                  : 'Knowledge compounds. Well earned, keep going.'
              }
            />
          </div>
          <h3 className="mt-4 font-serif text-2xl font-semibold text-ink-100">Lesson complete</h3>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Stat icon={Zap} label="XP gained" value={`+${result.xpGained} XP`} />
            <Stat icon={Flame} label="Streak" value={`${result.streak} ${result.streak === 1 ? 'day' : 'days'}`} />
          </div>

          <div className="mt-5 w-full text-left">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-ink-400">Daily goal</span>
              <span className="font-medium text-ink-200">
                {todayXp} / {dailyGoal} XP
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-transform duration-200 active:scale-95"
          >
            Continue Journey
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
