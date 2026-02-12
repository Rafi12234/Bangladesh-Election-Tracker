'use client';

import Image from 'next/image';

export default function VictoryPopup() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-black/80 via-black/75 to-black/80 backdrop-blur-md p-4">
      {/* Main popup card */}
      <div className="relative w-full max-w-md sm:max-w-lg">
        {/* Subtle outer glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-yellow-500/20 via-transparent to-yellow-500/20 blur-xl" />
        
        <div className="relative rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
          {/* Top gold accent */}
          <div className="h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500" />

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/80 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
                Official Declaration
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 text-center space-y-6">
            {/* BNP Logo */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <Image
                  src="/bnp.png"
                  alt="Bangladesh Nationalist Party"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Party name */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                Bangladesh Nationalist Party
              </h2>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 tracking-wide">(BNP)</p>
            </div>

            {/* Seat count */}
            <div className="inline-flex items-baseline gap-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-5 py-2.5">
              <span className="text-3xl sm:text-4xl font-black text-green-700 dark:text-green-400 tabular-nums">151+</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-500">seats</span>
            </div>

            {/* Message */}
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
              BNP has secured majority by winning more than 151 constituencies out of 300 and will form the next Government of the People&apos;s Republic of Bangladesh.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 px-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Majority: 151/300</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            </div>

            {/* Footer note */}
            <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
              This result is based on declared constituency results from the Election Commission of Bangladesh.
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-green-600 via-red-500 to-green-600" />
        </div>
      </div>
    </div>
  );
}
