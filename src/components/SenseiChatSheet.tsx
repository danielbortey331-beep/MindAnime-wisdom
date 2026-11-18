import { useEffect, useState } from 'react';
import { Flame, Sparkles, X } from 'lucide-react';
import { getSenseiReplies, type SenseiContext } from '@/lib/sensei';

interface SenseiChatSheetProps {
  context: SenseiContext;
  message: string;
  onClose: () => void;
  onOpenStreak: () => void;
}

export function SenseiChatSheet({ context, message, onClose, onOpenStreak }: SenseiChatSheetProps) {
  const replies = getSenseiReplies(context);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeReply = replies.find((reply) => reply.id === activeId) ?? null;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ask the Sensei"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85dvh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl border border-ink-800 bg-ink-900 px-6 pb-8 pt-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink-100">
            <Sparkles className="h-5 w-5 text-blue-400" />
            Ask the Sensei
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-300 transition-colors hover:text-ink-100 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-5 rounded-2xl rounded-bl-sm border border-blue-500/30 bg-ink-850/60 px-4 py-3 text-sm leading-relaxed text-ink-100">
          {message}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {replies.map((reply) => {
            const selected = reply.id === activeId;
            return (
              <button
                key={reply.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(reply.id)}
                className={`rounded-full border px-3.5 py-2 text-left text-xs font-medium transition-all active:scale-95 ${
                  selected
                    ? 'border-blue-400/60 bg-blue-500/15 text-blue-300'
                    : 'border-ink-700 bg-ink-850 text-ink-300 hover:border-blue-500/40 hover:text-blue-300'
                }`}
              >
                {reply.question}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mb-6 min-h-[4.5rem]">
          {activeReply ? (
            <div key={activeReply.id} className="animate-fade-in rounded-2xl border border-blue-500/25 bg-blue-500/5 p-4">
              <p className="mb-1 text-xs text-ink-400">{activeReply.question}</p>
              <p className="text-sm leading-relaxed text-ink-100">{activeReply.answer}</p>
            </div>
          ) : (
            <p className="text-xs text-ink-500">Choose a question to hear the Sensei&apos;s advice.</p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenStreak}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-5 py-2.5 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20 active:scale-95"
        >
          <Flame className="h-4 w-4" />
          Open streak calendar
        </button>
      </div>
    </div>
  );
}
