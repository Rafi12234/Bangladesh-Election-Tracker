'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/85 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center gap-3 font-bold text-bd-green dark:text-emerald-400 transition-all group hover:scale-105">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-bd-green to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-20 group-hover:opacity-30" />
            <Image 
              src="/logo.png?v=2" 
              alt="BD Election Logo" 
              width={42} 
              height={42} 
              className="relative group-hover:rotate-6 transition-transform duration-300 drop-shadow-lg"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-xl font-black tracking-tight bg-gradient-to-r from-bd-green to-emerald-600 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">BD Election</div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 -mt-0.5 tracking-widest">LIVE TRACKER</div>
          </div>
        </Link>

        {/* Centered Desktop Nav */}
        <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-2 md:flex bg-white/90 dark:bg-slate-800/90 rounded-full px-2 py-1.5 shadow-md border border-gray-200/70 dark:border-slate-700/70 backdrop-blur-lg">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/constituency">Constituency</NavLink>
        </nav>

        {/* Live indicator + Theme toggle + Mobile menu */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-full px-4 py-2 border border-red-200/50 dark:border-red-800/50 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 shadow-md" />
            </span>
            <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Live</span>
          </div>
          
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl p-2.5 text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:text-gray-300 dark:hover:from-slate-800 dark:hover:to-slate-700 md:hidden transition-all duration-200 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="border-t border-gray-100 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 md:hidden space-y-1.5 shadow-lg">
          <NavLink href="/" onClick={() => setMenuOpen(false)} mobile>Dashboard</NavLink>
          <NavLink href="/constituency" onClick={() => setMenuOpen(false)} mobile>Constituency</NavLink>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href, children, onClick, mobile,
}: {
  href: string; children: React.ReactNode; onClick?: () => void; mobile?: boolean;
}) {
  const base = mobile
    ? 'block py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-bd-green dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md'
    : 'rounded-full px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-bd-green hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105';
  return (
    <Link href={href} className={base} onClick={onClick}>
      {children}
    </Link>
  );
}
