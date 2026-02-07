'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center gap-3 font-bold text-bd-green dark:text-emerald-400 transition-all group hover:scale-105">
          <div className="relative">
            <div className="absolute inset-0 bg-bd-green/10 dark:bg-emerald-400/10 rounded-xl blur-md group-hover:blur-lg transition-all" />
            <Image 
              src="/logo.png?v=2" 
              alt="BD Election Logo" 
              width={40} 
              height={40} 
              className="relative group-hover:rotate-6 transition-transform duration-300"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-xl font-extrabold tracking-tight">BD Election</div>
            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 -mt-0.5">LIVE TRACKER</div>
          </div>
        </Link>

        {/* Centered Desktop Nav */}
        <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-2 md:flex bg-gray-50/80 dark:bg-slate-800/80 rounded-full px-2 py-1.5 shadow-sm border border-gray-200/50 dark:border-slate-700/50">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/map">Map</NavLink>
          <NavLink href="/news">News</NavLink>
        </nav>

        {/* Live indicator + Theme toggle + Mobile menu */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex bg-red-50/80 dark:bg-red-900/20 rounded-full px-3 py-1.5 border border-red-200/50 dark:border-red-800/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600 dark:bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Live</span>
          </div>
          
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 md:hidden transition-all duration-200 border border-gray-200 dark:border-slate-700"
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
        <nav className="border-t border-gray-100 dark:border-slate-700/50 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 md:hidden space-y-1">
          <NavLink href="/" onClick={() => setMenuOpen(false)} mobile>Dashboard</NavLink>
          <NavLink href="/map" onClick={() => setMenuOpen(false)} mobile>Map</NavLink>
          <NavLink href="/news" onClick={() => setMenuOpen(false)} mobile>News</NavLink>
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
    ? 'block py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-bd-green dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all duration-200'
    : 'rounded-full px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-900 hover:text-bd-green dark:hover:text-emerald-400 transition-all duration-200 hover:shadow-sm';
  return (
    <Link href={href} className={base} onClick={onClick}>
      {children}
    </Link>
  );
}
