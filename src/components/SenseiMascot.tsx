import { Flame } from 'lucide-react';

export type SenseiMood = 'welcoming' | 'celebrating' | 'urgent' | 'zen';

interface SenseiMascotProps {
  mood: SenseiMood;
  message: string;
}

const AURA_CLASS: Record<SenseiMood, string> = {
  welcoming: 'bg-gold-500/20',
  celebrating: 'bg-gold-400/35',
  urgent: 'bg-amber-500/35',
  zen: 'bg-sage-500/30',
};

const BUBBLE_CLASS: Record<SenseiMood, string> = {
  welcoming: 'border-gold-500/30',
  celebrating: 'border-gold-400/50',
  urgent: 'border-amber-500/40',
  zen: 'border-sage-500/40',
};

const INK = '#0a0a0b';

const EYES: Record<SenseiMood, string> = {
  welcoming: `<circle cx="50" cy="62" r="4" fill="${INK}"/><circle cx="70" cy="62" r="4" fill="${INK}"/><circle cx="51.2" cy="60.6" r="1.3" fill="#fff"/><circle cx="71.2" cy="60.6" r="1.3" fill="#fff"/>`,
  celebrating: `<path d="M44 63Q50 55 56 63M64 63Q70 55 76 63" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  urgent: `<path d="M43 53L55 58M77 53L65 58" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="63" r="3.5" fill="${INK}"/><circle cx="70" cy="63" r="3.5" fill="${INK}"/>`,
  zen: `<path d="M44 64Q50 69 56 64M64 64Q70 69 76 64" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
};

const MOUTH: Record<SenseiMood, string> = {
  welcoming: `<path d="M52 75Q60 81 68 75" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  celebrating: `<path d="M50 73Q60 89 70 73Z" fill="#8b3a3a"/>`,
  urgent: `<path d="M53 79Q60 74 67 79" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  zen: `<path d="M54 77Q60 80 66 77" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
};

const ACCENT: Record<SenseiMood, string> = {
  welcoming: '',
  celebrating: '<circle cx="18" cy="30" r="3" fill="#e8c87a"/><circle cx="104" cy="26" r="2.5" fill="#e8c87a"/><circle cx="108" cy="58" r="2" fill="#e8c87a"/>',
  urgent: '',
  zen: '<ellipse cx="60" cy="10" rx="18" ry="4" fill="none" stroke="#7fb88f" stroke-width="2.5"/>',
};

function buildFaceMarkup(mood: SenseiMood): string {
  return `
    <path d="M26 64C22 30 42 12 60 12s38 18 34 52c-2 16-8 30-34 30S28 80 26 64Z" fill="#0d0d10"/>
    <ellipse cx="60" cy="62" rx="22" ry="25" fill="#f0d2b4"/>
    <path d="M34 50C38 32 50 24 60 24s22 8 26 26c-8-8-18-12-26-12S42 42 34 50Z" fill="#17171c"/>
    <path d="M36 42Q60 30 84 42" stroke="url(#sensei-gold)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="72" rx="4" ry="2.5" fill="#e88a8a" opacity="0.35"/>
    <ellipse cx="78" cy="72" rx="4" ry="2.5" fill="#e88a8a" opacity="0.35"/>
    ${EYES[mood]}
    ${MOUTH[mood]}
    <path d="M34 92Q60 104 86 92L92 112H28Z" fill="#09090b" stroke="url(#sensei-gold)" stroke-width="3"/>
    ${ACCENT[mood]}
  `;
}

export function SenseiMascot({ mood, message }: SenseiMascotProps) {
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-24 w-24 flex-shrink-0">
        <div className={`absolute inset-0 rounded-full blur-xl animate-glow-pulse ${AURA_CLASS[mood]}`} />
        <div className={`relative h-full w-full ${mood === 'celebrating' ? 'animate-bounce' : 'animate-float'}`}>
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="sensei-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e8c87a" />
                <stop offset="1" stopColor="#b8902f" />
              </linearGradient>
            </defs>
            <g dangerouslySetInnerHTML={{ __html: buildFaceMarkup(mood) }} />
          </svg>
        </div>
        {mood === 'urgent' && (
          <Flame className="absolute -top-2 right-0 h-6 w-6 animate-glow-pulse text-amber-400" strokeWidth={2.5} />
        )}
      </div>
      <div
        className={`relative mb-4 rounded-2xl rounded-bl-sm border bg-ink-900/90 px-4 py-3 text-sm leading-relaxed text-ink-100 shadow-lg ${BUBBLE_CLASS[mood]}`}
      >
        {message}
      </div>
    </div>
  );
}
