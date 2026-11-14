import { dayKey } from '@/lib/gamification';

const REMINDER_KEY = 'mindanime-reminder';
const DEFAULT_TIME = '19:00';
const REMINDER_TITLE = 'Time for your MindAnime lesson';
const REMINDER_BODY = "Your mind is your sharpest blade. Ready for today's lesson?";

export interface ReminderSettings {
  enabled: boolean;
  time: string;
  lastFiredDate: string;
}

export type EnableReminderResult = 'granted' | 'denied' | 'unsupported';

function defaultSettings(): ReminderSettings {
  return { enabled: false, time: DEFAULT_TIME, lastFiredDate: '' };
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...(JSON.parse(raw) as Partial<ReminderSettings>) };
  } catch {
    return defaultSettings();
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

export async function enableReminders(): Promise<EnableReminderResult> {
  if (!('Notification' in window)) return 'unsupported';
  const permission =
    Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (permission !== 'granted') return 'denied';
  saveReminderSettings({ ...loadReminderSettings(), enabled: true });
  return 'granted';
}

async function showReminder(): Promise<void> {
  const options: NotificationOptions = { body: REMINDER_BODY, icon: '/icon.svg', tag: 'daily-reminder' };
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(REMINDER_TITLE, options);
    return;
  }
  new Notification(REMINDER_TITLE, options);
}

function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function startReminderWatcher(): () => void {
  const check = () => {
    const settings = loadReminderSettings();
    if (!settings.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    const today = dayKey(now);
    if (settings.lastFiredDate === today) return;
    if (now.getHours() * 60 + now.getMinutes() < minutesOfDay(settings.time)) return;

    saveReminderSettings({ ...settings, lastFiredDate: today });
    void showReminder();
  };

  check();
  const intervalId = window.setInterval(check, 60_000);
  document.addEventListener('visibilitychange', check);
  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', check);
  };
}
