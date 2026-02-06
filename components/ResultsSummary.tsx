'use client';

import { useMemo, useState } from 'react';
import type { ElectionSummary, SeatCount, AllianceSeatCount } from '@/types';
import { ELECTION_CONFIG } from '@/lib/constants';
import { formatNumber, formatPercentage, getRelativeTime } from '@/lib/utils';
import ParliamentSeats from './ParliamentSeats';

interface Props {
  summary: ElectionSummary;
  seatCounts: SeatCount[];
  allianceSeatCounts: AllianceSeatCount[];
}

export default function ResultsSummary({ summary, seatCounts, allianceSeatCounts }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [expandedAlliances, setExpandedAlliances] = useState<Set<string>>(new Set());
  const { TOTAL_SEATS } = ELECTION_CONFIG;

  // Sort alliances by percentage (highest first)
  const sortedAlliances = useMemo(() => {
    return [...allianceSeatCounts].sort((a, b) => b.votePercentage - a.votePercentage);
  }, [allianceSeatCounts]);

  const toggleAllianceExpanded = (allianceId: string) => {
    setExpandedAlliances(prev => {
      const next = new Set(prev);
      if (next.has(allianceId)) {
        next.delete(allianceId);
      } else {
        next.add(allianceId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Key metrics row with gradient cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <MetricCard label="Total Seats" value={TOTAL_SEATS} icon="📊" />
        <MetricCard label="Declared" value={summary.declaredSeats} accent icon="✅" />
        <MetricCard
          label="Avg. Turnout"
          value={formatPercentage(summary.averageTurnout)}
          icon="📈"
        />
      </div>

      {/* Leading Alliance Announcement */}
      {sortedAlliances.length > 0 && summary.declaredSeats > 0 && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-8 shadow-lg">
          {/* Background accent */}
          <div 
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: sortedAlliances[0].allianceColor }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: sortedAlliances[0].allianceColor }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Current Leading Alliance
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h3 
                  className="text-3xl sm:text-4xl font-black mb-2"
                  style={{ color: sortedAlliances[0].allianceColor }}
                >
                  {sortedAlliances[0].allianceName}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                  Leading with <span className="font-bold text-gray-900 dark:text-gray-100">{sortedAlliances[0].seats} seats</span> and{' '}
                  <span className="font-bold" style={{ color: sortedAlliances[0].allianceColor }}>
                    {formatPercentage(sortedAlliances[0].votePercentage)}
                  </span> of votes
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">
                    {sortedAlliances[0].seats}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Seats
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-3xl sm:text-4xl font-black"
                    style={{ color: sortedAlliances[0].allianceColor }}
                  >
                    {formatPercentage(sortedAlliances[0].votePercentage)}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Votes
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress to Victory</span>
                <span>{sortedAlliances[0].seats}/{TOTAL_SEATS} ({formatPercentage((sortedAlliances[0].seats / TOTAL_SEATS) * 100)})</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(sortedAlliances[0].seats / TOTAL_SEATS) * 100}%`,
                    backgroundColor: sortedAlliances[0].allianceColor,
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parliament visualization */}
      <ParliamentSeats allianceSeatCounts={sortedAlliances} totalSeats={summary.declaredSeats} />

      {/* Alliance highlight cards with enhanced design */}
      <div className="grid grid-cols-1 gap-4">
        {sortedAlliances.map((alliance) => {
          const isExpanded = expandedAlliances.has(alliance.allianceId);
          const progressPercentage = (alliance.seats / TOTAL_SEATS) * 100;
          return (
            <div
              key={alliance.allianceId}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50 transition-all duration-300 hover:shadow-xl"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: alliance.allianceColor,
              }}
            >
              {/* Background gradient accent */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: alliance.allianceColor }}
              />
              
              {/* Main alliance info */}
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: alliance.allianceColor }}>
                    {alliance.allianceName}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">{alliance.seats}</span>
                </div>
                
                {/* Progress bar showing seats out of 300 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                    <span className="font-medium">{alliance.seats}/{TOTAL_SEATS} seats</span>
                    <span className="font-semibold" style={{ color: alliance.allianceColor }}>{formatPercentage(progressPercentage)}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: alliance.allianceColor,
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{formatNumber(alliance.totalVotes)} votes</span>
                  <span className="font-semibold" style={{ color: alliance.allianceColor }}>{formatPercentage(alliance.votePercentage)} of votes</span>
                </div>
                {alliance.leadingSeats > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1.5">
                    <span className="text-amber-500 text-sm">⚡</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">+{alliance.leadingSeats} Leading</span>
                  </div>
                )}
                
                {/* Expand/Collapse button for party breakdown */}
                {alliance.parties.length > 0 && (
                  <button
                    onClick={() => toggleAllianceExpanded(alliance.allianceId)}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide' : 'Show'} Party Breakdown ({alliance.parties.length} parties)</span>
                    <svg 
                      className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Party breakdown table (expandable) */}
              {isExpanded && alliance.parties.length > 0 && (
                <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30 animate-slide-up">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
                        <tr>
                          <th className="px-4 py-2 uppercase tracking-wider">Party</th>
                          <th className="px-4 py-2 text-right uppercase tracking-wider">Won</th>
                          <th className="px-4 py-2 text-right hidden sm:table-cell uppercase tracking-wider">Leading</th>
                          <th className="px-4 py-2 text-right uppercase tracking-wider">Votes</th>
                          <th className="px-4 py-2 text-right hidden md:table-cell uppercase tracking-wider">Vote %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {alliance.parties.map(party => (
                          <tr key={party.partyId} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="flex items-center gap-2 px-4 py-2.5">
                              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full shadow-sm" style={{ backgroundColor: party.partyColor }} />
                              <span className="font-medium truncate text-gray-800 dark:text-gray-200">{party.partyName}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-gray-100">{party.seats}</td>
                            <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400 font-medium hidden sm:table-cell">{party.leadingSeats}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-gray-800 dark:text-gray-200">{formatNumber(party.totalVotes)}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">{formatPercentage(party.votePercentage)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand all parties button */}
      {seatCounts.length > 0 && (
        <button
          onClick={() => setShowAll(prev => !prev)}
          className="group w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <span>{showAll ? 'Hide All Parties' : `Show All ${seatCounts.length} Parties`}</span>
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
