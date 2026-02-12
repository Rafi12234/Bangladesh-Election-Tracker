'use client';

import { memo } from 'react';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface Entry {
  partyId: string;
  partyName: string;
  partyColor: string;
  candidateName: string;
  votes: number;
  percentage: number;
  isWinner?: boolean;
}

function VoteBar({ entries }: { entries: Entry[] }) {
  const sorted = [...entries].sort((a, b) => b.votes - a.votes);
  const maxVotes = sorted[0]?.votes || 1;

  return (
    <div className="space-y-3">
      {sorted.map(e => (
        <div key={e.partyId} className="group">
          <div className="flex items-center justify-between text-xs sm:text-sm gap-3">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 rounded-full shadow-sm" style={{ backgroundColor: e.partyColor }} />
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {e.partyName}
                {e.isWinner && <span className="ml-1.5 text-green-600 dark:text-emerald-400">✓</span>}
              </span>
              <span className="text-gray-500 dark:text-gray-400 truncate hidden sm:inline">{e.candidateName}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatNumber(e.votes)}</span>
              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">{formatPercentage(e.percentage)}</span>
            </div>
          </div>
          <div className="mt-1.5 h-2 sm:h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800 shadow-inner">
            <div
              className="progress-bar h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${(e.votes / maxVotes) * 100}%`,
                backgroundColor: e.partyColor,
                opacity: e.isWinner ? 1 : 0.75,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(VoteBar);
