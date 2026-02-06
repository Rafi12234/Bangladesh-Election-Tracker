'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Result, Party, Constituency } from '@/types';
import { RESULT_STATUS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

interface Props {
  results: Result[];
  parties: Party[];
  constituencies: Constituency[];
}

export default function ConstituencyList({ results, parties, constituencies }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'completed'>('all');
  const [search, setSearch] = useState('');

  // Build lookup maps
  const partyMap = useMemo(() => {
    const m: Record<string, Party> = {};
    parties.forEach(p => { m[p.id] = p; });
    return m;
  }, [parties]);

  const resultMap = useMemo(() => {
    const m: Record<string, Result> = {};
    results.forEach(r => { m[r.constituencyId] = r; });
    return m;
  }, [results]);

  // Filter and sort
  const filtered = useMemo(() => {
    let list = constituencies.map(c => ({
      constituency: c,
      result: resultMap[c.id] || null,
    }));

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(item => {
        if (statusFilter === 'pending') return !item.result;
        return item.result?.status === statusFilter;
      });
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item => item.constituency.name.toLowerCase().includes(q));
    }

    // Sort: completed first, then partial, then pending
    list.sort((a, b) => {
      const order = { completed: 0, partial: 1, pending: 2 };
      const aOrder = a.result ? order[a.result.status] : 2;
      const bOrder = b.result ? order[b.result.status] : 2;
      return aOrder - bOrder;
    });

    return list;
  }, [constituencies, resultMap, statusFilter, search]);

  return (
    <div>
      {/* Filters with modern design */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'completed', 'partial', 'pending'] as const).map((s, idx) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`group relative rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-bd-green to-emerald-600 dark:from-emerald-600 dark:to-emerald-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-105 shadow-sm'
              }`}
            >
              {statusFilter === s && (
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              )}
              <span className="relative">{s === 'all' ? 'All' : RESULT_STATUS[s].label}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search constituencies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-bd-green/30 focus:border-bd-green dark:focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* List with enhanced cards */}
      <div className="space-y-3">
        {filtered.slice(0, 50).map(({ constituency, result }) => {
          const winner = result?.winnerPartyId ? partyMap[result.winnerPartyId] : null;
          const status = result?.status || 'pending';
          const { label: statusLabel, color: statusColor } = RESULT_STATUS[status as keyof typeof RESULT_STATUS] || RESULT_STATUS.pending;

          return (
            <Link
              key={constituency.id}
              href={`/constituency/${constituency.id}`}
              className="group block rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white to-gray-50/30 dark:from-slate-900 dark:to-slate-900/50 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-slate-600"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Winner color indicator with glow */}
                  <div className="relative flex-shrink-0">
                    <div 
                      className="absolute inset-0 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity"
                      style={{ backgroundColor: winner?.color || '#E5E7EB' }}
                    />
                    <span
                      className="relative block h-4 w-4 rounded-full shadow-md group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: winner?.color || '#E5E7EB' }}
                    />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-bd-green dark:group-hover:text-emerald-400 transition-colors">
                      {constituency.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {winner ? (
                          <span style={{ color: winner.color }} className="font-semibold">{winner.shortName}</span>
                        ) : (
                          'Awaiting result'
                        )}
                      </p>
                      {result && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(result.totalVotes)} votes</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <span className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-[10px] sm:text-xs font-bold ${statusColor} whitespace-nowrap shadow-sm group-hover:shadow-md transition-shadow`}>
                  {statusLabel}
                </span>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No constituencies match your filters</p>
          </div>
        )}
        {filtered.length > 50 && (
          <div className="mt-6 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              <span>Showing 50 of {filtered.length} constituencies</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
