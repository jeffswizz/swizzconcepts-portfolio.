import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeMode } from '../App.tsx';

interface NavbarProps {
  brandName: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onContactClick: () => void;
}

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
];

export function Navbar({ brandName, theme, onToggleTheme, onContactClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5ED]/95 dark:bg-[#0D0D0F]/95 backdrop-blur-md border-b border-[#E8DFD0] dark:border-[#2A2A2E] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C47745]"
        >
          {brandName}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#242424]/80 dark:text-[#E8DFD0]/80 hover:text-[#242424] dark:hover:text-[#F8F5ED] border-b-2 border-transparent hover:border-[#C47745] py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C47745]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Black/White Mode Toggle + Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#FFFDF9] dark:bg-[#161618] text-[#242424] dark:text-[#F8F5ED] hover:border-[#C47745] transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C47745]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`w-[18px] h-[18px] transition-transform duration-300 ${isDark ? 'rotate-180' : 'rotate-0'}`}
            >
              <circle cx="12" cy="12" r="9.5" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 2.5A9.5 9.5 0 0 0 12 21.5Z" fill="#18181B" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onContactClick}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#242424] dark:focus-visible:outline-[#F8F5ED]"
          >
            Let's Work Together
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0]/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F8F5ED] dark:bg-[#0D0D0F] border-b border-[#E8DFD0] dark:border-[#2A2A2E] px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0]/60 dark:hover:bg-white/10 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onContactClick();
            }}
            className="w-full mt-2 px-4 py-3 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors cursor-pointer"
          >
            Let's Work Together
          </button>
        </div>
      )}
    </header>
  );
}
