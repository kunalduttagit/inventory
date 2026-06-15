'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  };

  if (!mounted) {
    return <div className="h-8" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-ink-500 hover:bg-ink-300/20 hover:text-ink-700 dark:text-night-muted dark:hover:bg-night-surface dark:hover:text-night-text transition-colors w-full"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <Sun className="w-4 h-4 text-accent-orange" />
      ) : (
        <Moon className="w-4 h-4 text-accent-purple" />
      )}
      <span>{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
