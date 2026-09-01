import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Users, TrendingUp, PenLine, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

const SLIDES = [
  {
    icon: BookOpen,
    title: 'Welcome to MindAnime',
    description:
      'A community-driven wisdom feed where curated insights from philosophy, psychology, and the great thinkers meet anime-inspired visuals.',
    accent: 'gold',
  },
  {
    icon: TrendingUp,
    title: 'Explore the Feed',
    description:
      'Browse curated and community-submitted insights. Upvote what resonates with you — the best ideas rise to the top for everyone to see.',
    accent: 'sage',
  },
  {
    icon: PenLine,
    title: 'Share Your Perspective',
    description:
      'Submit your own book breakdowns, philosophical reflections, or practical takeaways. Pair them with anime visuals and spark discussion.',
    accent: 'gold',
  },
  {
    icon: Users,
    title: 'Join the Discussion',
    description:
      'Every insight opens a live discussion. Share how principles played out in your life, learn from others, and build a daily wisdom streak.',
    accent: 'sage',
  },
];

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;
  const Icon = current.icon;
  const accentColor = current.accent === 'gold' ? 'gold' : 'sage';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 backdrop-blur-md animate-fade-in px-4">
      <div className="relative w-full max-w-lg animate-fade-in-up overflow-hidden rounded-3xl border border-ink-800 bg-ink-900/90 shadow-2xl shadow-black/50">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-ink-500 transition-colors hover:text-ink-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Slide content */}
        <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
              accentColor === 'gold'
                ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-600/20'
                : 'bg-gradient-to-br from-sage-400 to-sage-600 shadow-lg shadow-sage-600/20'
            }`}
          >
            <Icon className="h-8 w-8 text-ink-950" strokeWidth={2.5} />
          </div>

          <h2 className="mb-3 font-serif text-2xl font-semibold text-ink-100">
            {current.title}
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-300">
            {current.description}
          </p>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 pb-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === slide ? 'w-8 bg-gold-400' : 'w-1.5 bg-ink-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <button
            onClick={() => setSlide((s) => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="flex items-center gap-1 text-sm text-ink-400 transition-colors hover:text-ink-200 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {isLast ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-2.5 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30"
            >
              <Sparkles className="h-4 w-4" />
              Get Started
            </button>
          ) : (
            <button
              onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))}
              className="flex items-center gap-1 text-sm font-medium text-gold-400 transition-colors hover:text-gold-500"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
