import { useCallback, useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/supabase';

export const SPEECH_SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window;

const VOICE_PREF_KEY = 'mindanime-voice';
const QUEUE_DELAY_MS = 250;

export function buildPostSpeechText(post: Post): string {
  const parts = [post.title, post.excerpt];
  for (const section of post.body) {
    if (section.type === 'resources') continue;
    if (section.type === 'steps') parts.push(...section.content);
    else parts.push(section.content);
  }
  return sanitizeSpeechText(parts.filter(Boolean).join('\n\n'));
}

// Expands acronyms that mobile TTS engines tend to spell letter-by-letter
// or mangle, when the expansion is not already spelled out nearby.
// Micro-formatter: adds the small pauses a human speaker makes, so the
// narrator breathes instead of rushing through dense sentences.
export function humanizeForSpeech(text: string): string {
  return text
    .replace(/;\s*/g, ', ')
    .replace(/\s:\s/g, ', ')
    .replace(/([a-z])"\s/g, '$1, ')
    .replace(/\s+([.!?])(\s|$)/g, '$1$2')
    .replace(/\n+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();
}

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

const US_HQ_NAME = /natural|neural|Google US English|Microsoft (Aria|Guy|Jenny)/i;

export function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const normalize = (lang: string) => lang.replace('_', '-').toLowerCase();
  const byQuality = (a: SpeechSynthesisVoice, b: SpeechSynthesisVoice) => {
    const hq = Number(US_HQ_NAME.test(b.name)) - Number(US_HQ_NAME.test(a.name));
    return hq || a.name.localeCompare(b.name);
  };
  const us = [...voices].filter((voice) => normalize(voice.lang) === 'en-us').sort(byQuality);
  const otherEnglish = [...voices]
    .filter((voice) => normalize(voice.lang).startsWith('en') && normalize(voice.lang) !== 'en-us')
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...us, ...otherEnglish];
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!SPEECH_SUPPORTED) return;
    const load = () => setVoices(sortVoices(window.speechSynthesis.getVoices()));
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  return voices;
}

export function getStoredVoiceURI(): string | null {
  try {
    return localStorage.getItem(VOICE_PREF_KEY);
  } catch {
    return null;
  }
}

export function saveVoiceURI(uri: string): void {
  try {
    localStorage.setItem(VOICE_PREF_KEY, uri);
  } catch {
    // storage unavailable; voice applies for this session only
  }
}

function resolveVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const stored = getStoredVoiceURI();
  const found = stored ? voices.find((voice) => voice.voiceURI === stored) : undefined;
  return found ?? voices[0];
}

let voicesCache: SpeechSynthesisVoice[] = [];

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  // Mobile browsers garbage-collect utterances held only in local scope,
  // which drops words mid-sentence. Keep the active utterance and its
  // pending text in refs for the whole playback.
  const pendingRef = useRef<string[]>([]);
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const activeRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    clearTimer();
    pendingRef.current = [];
    queueRef.current = [];
    activeRef.current = null;
    if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speakNext = useCallback(() => {
    const text = pendingRef.current.shift();
    if (text === undefined) {
      activeRef.current = null;
      queueRef.current = [];
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = resolveVoice(voicesCache);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
      // Lock in the auto-selected American narrator across sessions.
      if (getStoredVoiceURI() !== voice.voiceURI) saveVoiceURI(voice.voiceURI);
      console.log('Active Narrator Voice:', voice.name);
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.93;
    utterance.pitch = 0.98;

    const advance = () => {
      if (activeRef.current !== utterance) return;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        speakNext();
      }, QUEUE_DELAY_MS);
    };
    utterance.onend = advance;
    utterance.onerror = advance;

    queueRef.current = [utterance];
    activeRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    (text: string, voices: SpeechSynthesisVoice[]) => {
      if (!SPEECH_SUPPORTED) return;
      window.speechSynthesis.cancel();
      clearTimer();
      pendingRef.current = [];
      queueRef.current = [];
      activeRef.current = null;

      const chunks = text
        .split(/\n\n+/)
        .map((chunk) => humanizeForSpeech(chunk))
        .filter(Boolean);
      if (chunks.length === 0) return;

      voicesCache = voices;
      pendingRef.current = chunks;
      setSpeaking(true);
      speakNext();
    },
    [speakNext],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    };
  }, []);

  return { speaking, speak, stop };
}
