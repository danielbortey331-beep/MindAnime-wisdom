import { useEffect, useState } from 'react';
import { Flame, X } from 'lucide-react';

interface MilestoneToastProps {
  milestone: number;
  onClose: () => void;
}

export function MilestoneToast({ milestone, onClose }: MilestoneToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    const autoClose = setTimeout(() => handleClose(), 5000);
    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const messages: Record<number, string> = {
    3: 'Three days in. You are building a habit.',
    7: 'A full week. This is where it sticks.',
    14: 'Two weeks of consistency. Impressive.',
    30: 'A full month. You are unstoppable.',
    50: 'Fifty days. Legendary dedication.',
    100: 'One hundred days. You are in the top 1%.',
  };

  return (
    <div
      className={`fixed left-1/2 top-20 z-[60] -translate-x-1/2 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-4 rounded-2xl border border-gold-500/40 bg-ink-900/95 px-6 py-4 shadow-2xl shadow-gold-600/20 backdrop-blur-xl">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-600/30">
          <Flame className="h-6 w-6 text-ink-950" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-serif text-base font-semibold text-gold-400">
            {milestone} Day Streak!
          </p>
          <p className="text-sm text-ink-300">{messages[milestone] ?? 'Keep going!'}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-2 flex-shrink-0 text-ink-500 transition-colors hover:text-ink-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
