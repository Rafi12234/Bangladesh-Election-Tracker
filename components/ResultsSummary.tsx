'use client';

import { useMemo, useState } from 'react';
import type { ElectionSummary, SeatCount } from '@/types';
import { ELECTION_CONFIG } from '@/lib/constants';
import { formatNumber, formatPercentage, getRelativeTime } from '@/lib/utils';
import SeatCounter from './SeatCounter';

interface Props {
  summary: ElectionSummary;
  seatCounts: SeatCount[];
}

export default function ResultsSummary({ summary, seatCounts }: Props) {
  const [showAll, setShowAll] = useState(false);
  const { TOTAL_SEATS, MAJORITY_SEATS } = ELECTION_CONFIG;

  // Top 2 parties
  const top2 = useMemo(() => seatCounts.slice(0, 2), [seatCounts]);

  return (
    <div className="space-y-6 fade-in">
      {/* Key metrics row with gradient cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <MetricCard label="Total Seats" value={TOTAL_SEATS} icon="📊" />
        <MetricCard label="Declared" value={summary.declaredSeats} accent icon="✅" />
        <MetricCard label="Majority" value={MAJORITY_SEATS} icon="🎯" />
        <MetricCard
          label="Avg. Turnout"
          value={formatPercentage(summary.averageTurnout)}
          icon="📈"
        />
      </div>

      {/* Seat counter bar */}
      <SeatCounter seatCounts={seatCounts} declaredSeats={summary.declaredSeats} showAll={showAll} />

      {/* Top 2 party highlight cards with enhanced design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {top2.map((sc, idx) => (
          <div
            key={sc.partyId}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: sc.partyColor,
            }}
          >
            {/* Background gradient accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"
              style={{ backgroundColor: sc.partyColor }}
            />
            
            {/* Ranking badge */}
            <div className="absolute top-3 right-3 bg-gray-100 dark:bg-slate-800 rounded-full px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-400">
              #{idx + 1}
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: sc.partyColor }}>
                  {sc.partyName}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">{sc.seats}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">{formatNumber(sc.totalVotes)} votes</span>
                <span className="font-semibold" style={{ color: sc.partyColor }}>{formatPercentage(sc.votePercentage)}</span>
              </div>
              {sc.leadingSeats > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1.5">
                  <span className="text-amber-500 text-sm">⚡</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">+{sc.leadingSeats} Leading</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expand all parties button */}
      {seatCounts.length > 2 && (
        <button
          onClick={() => setShowAll(prev => !prev)}
          className="group w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <span>{showAll ? 'Show Top 2 Only' : `Show All ${seatCounts.length} Parties`}</span>
          <svg 
            className={`h-4 w-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* All parties table (expandable) */}
      {showAll && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/50 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 font-semibold">
                <tr>
                  <th className="px-3 sm:px-4 py-3 uppercase tracking-wider">Party</th>
                  <th className="px-3 sm:px-4 py-3 text-right uppercase tracking-wider">Won</th>
                  <th className="px-3 sm:px-4 py-3 text-right hidden sm:table-cell uppercase tracking-wider">Leading</th>
                  <th className="px-3 sm:px-4 py-3 text-right uppercase tracking-wider">Votes</th>
                  <th className="px-3 sm:px-4 py-3 text-right hidden md:table-cell uppercase tracking-wider">Vote %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {seatCounts.map(sc => (
                  <tr key={sc.partyId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-3">
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: sc.partyColor }} />
                      <span className="font-semibold truncate text-gray-900 dark:text-gray-100">{sc.partyName}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">{sc.seats}</td>
                    <td className="px-3 sm:px-4 py-3 text-right text-gray-600 dark:text-gray-400 font-medium hidden sm:table-cell">{sc.leadingSeats}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">{formatNumber(sc.totalVotes)}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">{formatPercentage(sc.votePercentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last updated */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        Last updated: {getRelativeTime(summary.lastUpdated)}
      </p>
    </div>
  );
}

function MetricCard({
  label, value, accent, icon,
}: {
  label: string; value: string | number; accent?: boolean; icon?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900 p-4 sm:p-5 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        {icon && <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>}
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-xl sm:text-3xl font-black mt-2 ${accent ? 'text-bd-green dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
      </div>
    </div>
  );
}
