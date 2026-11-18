import { Flame } from 'lucide-react';

export type SenseiMood = 'welcoming' | 'celebrating' | 'urgent' | 'zen';

interface SenseiMascotProps {
  mood: SenseiMood;
  message: string;
  onClick?: () => void;
}

const GLOW: Record<SenseiMood, string> = {
  welcoming: 'bg-blue-500/30',
  celebrating: 'bg-cyan-400/40',
  urgent: 'bg-amber-500/35',
  zen: 'bg-sky-300/30',
};

const RING: Record<SenseiMood, string> = {
  welcoming: 'border-blue-400/70',
  celebrating: 'border-cyan-300/80',
  urgent: 'border-amber-400/80',
  zen: 'border-sky-300/70',
};

const BUBBLE: Record<SenseiMood, string> = {
  welcoming: 'border-blue-500/30',
  celebrating: 'border-cyan-400/40',
  urgent: 'border-amber-500/40',
  zen: 'border-sky-400/40',
};

const INK = '#0b0b10';

function fade(on: boolean): string {
  return `transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`;
}

export function SenseiMascot({ mood, message, onClick }: SenseiMascotProps) {
  const eyesOpen = mood === 'celebrating' || mood === 'zen';
  const bob = mood === 'celebrating' ? 'animate-bounce' : 'animate-float';

  const body = (
    <>
      <div className="relative h-28 w-28 flex-shrink-0">
        <div className={`absolute inset-2 rounded-full blur-xl transition-colors duration-700 ${GLOW[mood]}`} />
        <div
          className={`absolute inset-0 rounded-full border-2 animate-pulse transition-colors duration-700 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] ${RING[mood]}`}
        />
        <div
          className={`absolute -inset-1.5 rounded-full border animate-pulse opacity-60 transition-colors duration-700 ${RING[mood]}`}
          style={{ animationDelay: '900ms' }}
        />
        <div className={`relative h-full w-full ${bob}`}>
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <path d="M28 66L18 30L36 42L38 14L50 32L60 8L70 32L82 14L84 42L102 30L92 66Q60 84 28 66Z" fill="#cdd5e3" />
            <rect x="52" y="80" width="16" height="12" fill="#ecc9ad" />
            <ellipse cx="60" cy="64" rx="21" ry="24" fill="#f6dcc4" />
            <path d="M37 52L40 34L50 44L56 28L62 44L70 30L74 46L84 36L83 54Q60 46 37 52Z" fill="#f5f7fb" />
            <ellipse cx="43" cy="74" rx="4" ry="2.5" fill="#f08b8b" opacity="0.35" />
            <ellipse cx="77" cy="74" rx="4" ry="2.5" fill="#f08b8b" opacity="0.35" />

            <g className={fade(eyesOpen)} style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.9))' }}>
              <ellipse cx="50" cy="63" rx="4" ry="4.5" fill="#7dd3fc" />
              <ellipse cx="70" cy="63" rx="4" ry="4.5" fill="#7dd3fc" />
              <circle cx="50" cy="63" r="1.8" fill={INK} />
              <circle cx="70" cy="63" r="1.8" fill={INK} />
            </g>

            <g
              style={{
                transform: eyesOpen ? 'translateY(-14px)' : 'translateY(0px)',
                transition: 'transform 700ms ease-in-out',
              }}
            >
              <path d="M26 60Q60 52 94 60L94 70Q60 62 26 70Z" fill={INK} />
              <path d="M90 66L100 74L96 78L88 70Z" fill={INK} />
              <path
                d="M28 65Q60 57 92 65"
                stroke="#67e8f9"
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
                className={`animate-glow-pulse ${eyesOpen ? 'opacity-0' : ''}`}
              />
            </g>

            <path
              d="M52 76Q60 82 68 76"
              stroke={INK}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              className={fade(mood === 'welcoming')}
            />
            <path d="M50 74Q60 88 70 74Z" fill="#8b3a3a" className={fade(mood === 'celebrating')} />
            <path
              d="M53 79Q60 74 67 79"
              stroke={INK}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              className={fade(mood === 'urgent')}
            />
            <path
              d="M54 77Q60 80 66 77"
              stroke={INK}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              className={fade(mood === 'zen')}
            />

            <path d="M40 84Q60 78 80 84L84 100Q60 94 36 100Z" fill="#1a1e28" />
            <path d="M26 118L30 98Q60 86 90 98L94 118Z" fill="#0c0e14" />
            <path d="M52 92L60 104L68 92" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8" />

            <g className={fade(mood === 'celebrating')}>
              <circle cx="14" cy="30" r="3" fill="#67e8f9" />
              <circle cx="106" cy="26" r="2.5" fill="#67e8f9" />
              <circle cx="108" cy="58" r="2" fill="#67e8f9" />
            </g>
            <ellipse
              cx="60"
              cy="4"
              rx="16"
              ry="3.5"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="2"
              className={fade(mood === 'zen')}
            />
          </svg>
        </div>
        {mood === 'urgent' && (
          <Flame className="absolute -top-1 right-0 h-6 w-6 animate-glow-pulse text-amber-400" strokeWidth={2.5} />
        )}
      </div>

      <div
        key={message}
        className={`relative mb-4 min-w-0 flex-1 animate-fade-in rounded-2xl rounded-bl-sm border bg-ink-900/90 px-4 py-3 text-sm leading-relaxed text-ink-100 shadow-lg transition-colors duration-700 group-hover:border-ink-700 ${BUBBLE[mood]}`}
      >
        <p>{message}</p>
        {onClick && <p className="mt-1.5 text-xs text-ink-400">Tap to ask the Sensei</p>}
      </div>
    </>
  );

  const frameClass = 'flex w-full items-end gap-3 rounded-3xl text-left';
  if (!onClick) {
    return <div className={frameClass}>{body}</div>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask the Sensei"
      className={`group ${frameClass} transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60`}
    >
      {body}
    </button>
  );
}
