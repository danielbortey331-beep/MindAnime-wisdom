const MUTE_KEY = 'mindanime-feedback-muted';

let audioContext: AudioContext | null = null;

export function isFeedbackMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function setFeedbackMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, String(muted));
}

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  peak: number,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.05);
}

export function hapticTap(): void {
  if (!isFeedbackMuted()) navigator.vibrate?.(12);
}

export function celebrateCompletion(): void {
  if (isFeedbackMuted()) return;
  navigator.vibrate?.([12, 60, 18]);
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playTone(ctx, 880, t, 0.5, 0.12);
  playTone(ctx, 1320, t + 0.12, 0.6, 0.1);
  playTone(ctx, 1760, t + 0.24, 0.8, 0.08);
}
