import { Lock } from 'lucide-react';
import { CATEGORIES, PREMIUM_CATEGORIES, type Category } from '@/lib/supabase';

interface CategoryFilterProps {
  active: Category;
  onChange: (cat: Category) => void;
  isAdmin?: boolean;
}

export function CategoryFilter({ active, onChange, isAdmin }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
      {CATEGORIES.map((cat) => {
        const isPremium = PREMIUM_CATEGORIES.includes(cat) && cat !== 'All';
        const showLock = isPremium && !isAdmin;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              active === cat
                ? 'border-gold-500 bg-gold-500/15 text-gold-400'
                : 'border-ink-800 bg-ink-900/40 text-ink-300 hover:border-ink-700 hover:text-ink-100'
            }`}
          >
            {showLock && <Lock className="h-3 w-3" />}
            {cat}
          </button>
        );
      })}
    </div>
  );
}
