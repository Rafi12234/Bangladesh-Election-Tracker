'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function VictoryPopup() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Confetti / celebration background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] text-5xl animate-bounce">🎉</div>
        <div className="absolute top-[15%] right-[15%] text-4xl animate-bounce delay-100">✨</div>
        <div className="absolute top-[60%] left-[8%] text-4xl animate-bounce delay-200">🎊</div>
        <div className="absolute top-[55%] right-[10%] text-5xl animate-bounce delay-300">🏆</div>
        <div className="absolute top-[30%] left-[50%] text-3xl animate-bounce delay-150">🇧🇩</div>
        <div className="absolute top-[75%] left-[40%] text-4xl animate-bounce delay-250">🎆</div>
      </div>

      {/* Main popup card */}
      <div className="relative w-full max-w-lg rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-white via-red-50 to-yellow-50 dark:from-slate-900 dark:via-red-950/30 dark:to-yellow-950/20 shadow-2xl overflow-hidden animate-scale-in">
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-600" />

        {/* Trophy banner */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600 py-3 text-center">
          <span className="text-2xl sm:text-3xl font-black text-yellow-900 dark:text-yellow-100 tracking-wider uppercase">
            🏆 Victory Declared 🏆
          </span>
        </div>

        <div className="p-6 sm:p-8 text-center space-y-5">
          {/* BNP Logo */}
          <div className="flex justify-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36">
              <Image
                src="/bnp.png"
                alt="Bangladesh Nationalist Party"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>

          {/* Party name and symbol */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-400 leading-tight">
              Bangladesh Nationalist Party (BNP)
            </h2>
            <p className="text-4xl mt-2">🌾</p>
          </div>

          {/* Victory message */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-full px-6 py-2">
              <span className="text-green-700 dark:text-green-400 font-black text-lg sm:text-xl">
                150+ Seats Won
              </span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
              BNP has won more than <span className="text-red-600 dark:text-red-400 font-black">150 constituencies</span> and will form the next <span className="text-green-700 dark:text-green-400 font-black">Government of Bangladesh</span>.
            </p>
          </div>

          {/* Majority info */}
          <div className="bg-gray-100 dark:bg-slate-800 rounded-xl px-5 py-3 inline-block">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Majority threshold: <span className="text-gray-900 dark:text-gray-100 font-black">151 out of 300</span> seats
            </p>
          </div>

          {/* Bangladesh flag colors divider */}
          <div className="flex items-center gap-0 rounded-full overflow-hidden h-2 mx-auto max-w-xs">
            <div className="flex-1 bg-green-600 h-full" />
            <div className="flex-1 bg-red-500 h-full" />
            <div className="flex-1 bg-green-600 h-full" />
          </div>

          {/* Continue button */}
          <button
            onClick={() => setDismissed(true)}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-bold text-base sm:text-lg py-3.5 px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue to Election Dashboard →
          </button>
        </div>

        {/* Bottom accent bar */}
        <div className="h-2 bg-gradient-to-r from-green-600 via-red-500 to-green-600" />
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
