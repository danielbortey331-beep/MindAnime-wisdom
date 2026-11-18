import { useState } from 'react';
import { Check, ChevronDown, Volume2 } from 'lucide-react';

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedURI: string | null;
  onSelect: (voiceURI: string) => void;
}

function shortName(voice: SpeechSynthesisVoice): string {
  return voice.name.replace(/^(Microsoft|Google)\s+/i, '').replace(/\s+(Online.*)?\(Natural\).*$/i, '').trim();
}

export function VoiceSelector({ voices, selectedURI, onSelect }: VoiceSelectorProps) {
  const [open, setOpen] = useState(false);
  if (voices.length < 2) return null;

  const selected = voices.find((voice) => voice.voiceURI === selectedURI) ?? voices[0];

  return (
    <div className="relative min-w-0 flex-1 sm:flex-none">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-xs font-medium text-ink-200 transition-colors hover:border-gold-500/40 active:scale-95"
      >
        <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-gold-400" />
        <span className="min-w-0 truncate">{shortName(selected)}</span>
        <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close voice list"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            aria-label="Available voices"
            className="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 py-1 shadow-2xl shadow-black/50 sm:right-auto sm:w-64"
          >
            {voices.map((voice) => {
              const active = voice.voiceURI === selected?.voiceURI;
              return (
                <li key={voice.voiceURI}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onSelect(voice.voiceURI);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${
                      active ? 'bg-gold-500/10 text-gold-400' : 'text-ink-200 hover:bg-ink-850'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{shortName(voice)}</span>
                      <span className="block truncate text-[10px] text-ink-500">{voice.lang}</span>
                    </span>
                    {active && <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={3} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
