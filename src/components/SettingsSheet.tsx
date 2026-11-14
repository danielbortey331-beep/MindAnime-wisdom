import { useState } from 'react';
import { Bell, Volume2, X } from 'lucide-react';
import { hapticTap, isFeedbackMuted, setFeedbackMuted } from '@/utils/feedback';
import {
  enableReminders,
  loadReminderSettings,
  saveReminderSettings,
  type EnableReminderResult,
  type ReminderSettings,
} from '@/lib/reminders';

interface SettingsSheetProps {
  onClose: () => void;
}

const BLOCKED_NOTICE: Record<Exclude<EnableReminderResult, 'granted'>, string> = {
  denied: 'Notifications are blocked. Allow them in your browser settings to get reminders.',
  unsupported: 'This browser does not support notifications.',
};

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-40 ${
        checked ? 'border-gold-500/60 bg-gold-500/30' : 'border-ink-700 bg-ink-850'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5 bg-gold-400' : 'translate-x-0 bg-ink-400'
        }`}
      />
    </button>
  );
}

export function SettingsSheet({ onClose }: SettingsSheetProps) {
  const [muted, setMuted] = useState(isFeedbackMuted);
  const [reminder, setReminder] = useState<ReminderSettings>(loadReminderSettings);
  const [notice, setNotice] = useState<string | null>(null);

  const toggleMuted = () => {
    const next = !muted;
    setFeedbackMuted(next);
    setMuted(next);
    if (!next) hapticTap();
  };

  const toggleReminder = async () => {
    if (reminder.enabled) {
      const next = { ...reminder, enabled: false };
      saveReminderSettings(next);
      setReminder(next);
      setNotice(null);
      return;
    }
    const result = await enableReminders();
    if (result === 'granted') {
      setReminder(loadReminderSettings());
      setNotice(null);
    } else {
      setNotice(BLOCKED_NOTICE[result]);
    }
  };

  const changeTime = (time: string) => {
    if (!time) return;
    const next = { ...reminder, time };
    saveReminderSettings(next);
    setReminder(next);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85dvh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl border border-ink-800 bg-ink-900 px-6 pb-10 pt-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink-100">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-300 transition-colors hover:text-ink-100 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-400">Feedback</p>
        <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-ink-800 bg-ink-850/50 p-4">
          <div className="flex items-start gap-3">
            <Volume2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-400" />
            <div>
              <p className="text-sm font-medium text-ink-100">Haptics and sounds</p>
              <p className="text-xs text-ink-400">Subtle vibration and chimes on key moments</p>
            </div>
          </div>
          <Toggle checked={!muted} onChange={toggleMuted} label="Haptics and sounds" />
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-400">Reminders</p>
        <div className="rounded-2xl border border-ink-800 bg-ink-850/50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-400" />
              <div>
                <p className="text-sm font-medium text-ink-100">Daily Study Reminder</p>
                <p className="text-xs text-ink-400">A nudge to keep your learning habit alive</p>
              </div>
            </div>
            <Toggle
              checked={reminder.enabled}
              onChange={toggleReminder}
              label="Daily Study Reminder"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-ink-800 pt-4">
            <label htmlFor="reminder-time" className="text-sm text-ink-300">
              Remind me at
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminder.time}
              disabled={!reminder.enabled}
              onChange={(e) => changeTime(e.target.value)}
              className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 transition-colors focus:border-gold-500/50 focus:outline-none disabled:opacity-40 [color-scheme:dark]"
            />
          </div>

          {notice && <p className="mt-4 text-xs leading-relaxed text-gold-400">{notice}</p>}
        </div>
      </div>
    </div>
  );
}
