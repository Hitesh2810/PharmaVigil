import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_STORAGE_KEY = 'pharmavigil-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const nextTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');

    setTheme(nextTheme);
    document.documentElement.classList.toggle('theme-light', nextTheme === 'light');
    document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle('theme-light', nextTheme === 'light');
    document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="theme-toggle-btn fixed top-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-surface/95 text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:top-8 sm:right-8"
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all duration-300">
        <Sun
          className={`absolute h-5 w-5 transition-transform duration-300 ${theme === 'light' ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
          aria-hidden="true"
        />
        <Moon
          className={`absolute h-5 w-5 transition-transform duration-300 ${theme === 'dark' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
