import { useEffect, useState } from 'react';
import { Download, Loader2, Share2, X } from 'lucide-react';
import { renderQuoteCard } from '@/utils/quoteCard';

interface ShareQuoteModalProps {
  quote: string;
  title: string;
  category: string;
  onClose: () => void;
}

interface RenderedCard {
  file: File;
  url: string;
}

const FILE_NAME = 'mindanime-wisdom.png';

export function ShareQuoteModal({ quote, title, category, onClose }: ShareQuoteModalProps) {
  const [card, setCard] = useState<RenderedCard | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    renderQuoteCard({ quote, title, category })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setCard({ file: new File([blob], FILE_NAME, { type: 'image/png' }), url: objectUrl });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [quote, title, category]);

  const canShareFile =
    card !== null &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [card.file] });

  const handleShare = async () => {
    if (!card) return;
    try {
      await navigator.share({ files: [card.file], title: 'MindAnime', text: quote });
    } catch {
      // Share was dismissed or unavailable; the download button stays available.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share wisdom"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-md animate-slide-up flex-col overflow-y-auto rounded-t-3xl border border-gold-500/30 bg-ink-900 px-6 pb-8 pt-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink-100">Share Wisdom</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-300 transition-colors hover:text-ink-100 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl border border-ink-700 shadow-2xl" style={{ aspectRatio: '9 / 16' }}>
          {card ? (
            <img src={card.url} alt="Story-ready quote card preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ink-850">
              {failed ? (
                <p className="px-6 text-center text-xs text-ink-400">Could not create the card. Please try again.</p>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              )}
            </div>
          )}
        </div>

        {card && (
          <div className="mt-6 flex flex-col gap-3">
            {canShareFile && (
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-transform active:scale-95"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            )}
            <a
              href={card.url}
              download={FILE_NAME}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-6 py-3 text-sm font-medium text-ink-200 transition-colors hover:border-gold-500/40 hover:text-gold-400 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
