import { memo } from 'react';

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} <span className="font-bold text-bd-green dark:text-emerald-400">TeamNULL</span>. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            Bangladesh Election Tracker - Empowering Democracy Through Transparency
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
