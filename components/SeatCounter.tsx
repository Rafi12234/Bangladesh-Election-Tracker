'use client';

import { memo } from 'react';
import type { SeatCount } from '@/types';
import { ELECTION_CONFIG } from '@/lib/constants';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface Props {
  seatCounts: SeatCount[];
  declaredSeats: number;
  showAll?: boolean;
}

function SeatCounter({ seatCounts, declaredSeats, showAll = false }: Props) {
  const { TOTAL_SEATS } = ELECTION_CONFIG;
  const displayed = showAll ? seatCounts : seatCounts.slice(0, 2);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-soft">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Seat Count</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {declaredSeats}/{TOTAL_SEATS} declared
        </span>
      </div>

      {/* Seat bar (no majority line) */}
      <div className="relative mb-4 h-6 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
        {/* Stacked bar per party */}
        {seatCounts.reduce<{ elements: React.ReactNode[]; offset: number }>(
          (acc, sc) => {
            const width = (sc.seats / TOTAL_SEATS) * 100;
            if (width <= 0) return acc;
            acc.elements.push(
              <div
                key={sc.partyId}
                className="absolute inset-y-0 transition-all duration-500"
                style={{
                  left: `${acc.offset}%`,
                  width: `${width}%`,
                  backgroundColor: sc.partyColor,
                }}
              />
            );
            acc.offset += width;
            return acc;
          },
          { elements: [], offset: 0 }
        ).elements}
      </div>

      {/* Party rows */}
      <div className="space-y-2">
        {displayed.map(sc => (
          <div key={sc.partyId} className="flex items-center gap-2 sm:gap-3 text-sm">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: sc.partyColor }}
            />
            <span className="w-10 sm:w-12 font-medium text-gray-900 text-xs sm:text-sm">{sc.partyName}</span>
            <span className="font-bold text-gray-900">{sc.seats}</span>
            {sc.leadingSeats > 0 && (
              <span className="text-xs text-gray-500 hidden sm:inline">+{sc.leadingSeats} leading</span>
            )}
            <span className="ml-auto text-[10px] sm:text-xs text-gray-500 text-right">
              <span className="hidden sm:inline">{formatPercentage(sc.votePercentage)} &middot; </span>{formatNumber(sc.totalVotes)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(SeatCounter);
