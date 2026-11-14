import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed left-1/2 top-3 z-[80] flex -translate-x-1/2 animate-fade-in-up items-center gap-2 whitespace-nowrap rounded-full border border-gold-500/40 bg-ink-900/90 px-4 py-2 text-xs font-medium text-gold-400 shadow-lg backdrop-blur-md"
    >
      <WifiOff className="h-3.5 w-3.5" strokeWidth={2.5} />
      Offline Mode — Reading Cached Wisdom
    </div>
  );
}
