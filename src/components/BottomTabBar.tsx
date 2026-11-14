import { Newspaper, Flame, PenLine, Lightbulb, Settings, type LucideIcon } from 'lucide-react';
import { hapticTap } from '@/utils/feedback';

export type TabId = 'feed' | 'streak' | 'share' | 'about' | 'settings';

interface BottomTabBarProps {
  active: TabId;
  onSelect: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'feed', label: 'Feed', icon: Newspaper },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'share', label: 'Share', icon: PenLine },
  { id: 'about', label: 'About', icon: Lightbulb },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomTabBar({ active, onSelect }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md select-none border-t border-ink-800/80 bg-ink-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  onSelect(id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-gold-400' : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
