import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, functionsUrl, type Post } from '@/lib/supabase';
import type { Post } from '@/lib/supabase';

export const SPEECH_SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window;

export type NarrationEngine = 'elevenlabs' | 'browser';

export function buildPostSpeechText(post: Post): string {
  const parts = [post.title, post.excerpt];
  for (const section of post.body) {
    if (section.type === 'resources') continue;
    if (section.type === 'steps') parts.push(...section.content);
    else parts.push(section.content);
  }
  return sanitizeSpeechText(parts.filter(Boolean).join('\n\n'));
}

// Micro-formatter: adds the small pauses a human speaker makes, so the
// narrator breathes instead of rushing through dense sentences.
export function humanizeForSpeech(text: string): string {
  return text
    .replace(/;\s*/g, ', ')
    .replace(/\s:\s/g, ', ')
    .replace(/,\\s*,/g, ',')
    .trim();
}

// Expands acronyms that TTS engines tend to spell letter-by-letter.
const ACRONYM_EXPANSIONS: [RegExp, string][] = [
  [/\bRAS\b/g, 'Reticular Activating System'],
  [/\bAI\b/g, 'A.I.'],
  [/\bAPIs?\b/g, 'A.P.I.s'],
  [/\bCEO\b/g, 'C.E.O.'],
  [/\bIQ\b/g, 'I.Q.'],
  [/\bUX\b/g, 'U.X.'],
  [/\bUI\b(?!\/)/g, 'U.I.'],
  [/\bTTS\b/g, 'text to speech'],
];

export function sanitizeSpeechText(raw: string): string {
  let text = raw;
  for (const [pattern, replacement] of ACRONYM_EXPANSIONS) text = text.replace(pattern, replacement);
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*|__|~~|`+/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[•▪◦]/g, ',')
    .replace(/[–—]/g, ', ')
    .replace(/\[|\]|\{|\}|<|>|\|/g, ' ')
    .replace(/https?:\/\/\S+/g, 'a link')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function useNarration() {
  const [engine, setEngine] = useState<NarrationEngine>('elevenlabs');
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanupAudio();
    if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    setStatus('idle');
  }, [cleanupAudio]);

  const speakWithBrowser = useCallback((text: string) => {
    if (!SPEECH_SUPPORTED) {
      setError('Audio is not supported on this device');
      setStatus('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.93;
    utterance.pitch = 0.98;
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');
    setStatus('playing');
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus('paused');
    } else if (SPEECH_SUPPORTED) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setStatus('playing');
    } else if (SPEECH_SUPPORTED) {
      window.speechSynthesis.resume();
      setStatus('playing');
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      setError(null);
      cleanupAudio();
      if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = sessionData.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${functionsUrl}/narrate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `Narration failed (${response.status})`);
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('audio')) throw new Error('Unexpected narration response');

        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          cleanupAudio();
          setStatus('idle');
        };
        audio.onerror = () => {
          cleanupAudio();
          setStatus('idle');
          setError('Audio playback failed');
        };
        setStatus('playing');
        await audio.play();
      } catch (err) {
        cleanupAudio();
        // Fall back to the built-in device voice so audio still works offline
        // or when the narration service is unavailable.
        setEngine('browser');
        speakWithBrowser(text);
        if (err instanceof Error && !/failed|network/i.test(err.message)) {
          setError(err.message);
        }
      }
    },
    [cleanupAudio, speakWithBrowser],
  );

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    };
  }, [cleanupAudio]);

  return { engine, status, error, speak, pause, resume, stop };
}
