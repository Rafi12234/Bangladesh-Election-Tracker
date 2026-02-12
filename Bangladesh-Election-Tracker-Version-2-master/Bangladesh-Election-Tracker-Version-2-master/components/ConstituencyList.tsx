'use client';

/**
 * ConstituencyList — Displays all 300 constituencies with filters and search.
 *
 * PERF OPTIMIZATIONS:
 * - React.memo on sub-components to prevent cascading re-renders
 * - useMemo for resultMap, partyMap, and filtered list
 * - IntersectionObserver-based infinite scroll (no heavy npm dep)
 * - useCallback for filter handlers
 * - Search input sanitized to prevent HTML injection
 */

import Link from 'next/link';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { Result, Party, Constituency } from '@/types';
import { RESULT_STATUS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { getWinnerDisplayName } from '@/lib/alliances';
import Pagination from '@/components/Pagination';

interface Props {
  results: Result[];
  parties: Party[];
  constituencies: Constituency[];
  /** When true, replaces infinite scroll with numbered pagination */
  enablePagination?: boolean;
  /** Items per page when pagination is enabled (default 20) */
  itemsPerPage?: number;
}

// PERF: Progressive rendering batch sizes
const INITIAL_RENDER_COUNT = 30;
const LOAD_MORE_COUNT = 30;

function ConstituencyListInner({ results, parties, constituencies, enablePagination = false, itemsPerPage = 20 }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'counting' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

    // SECURITY: Sanitize search query — strip HTML tags
    if (search.trim()) {
      const q = search.toLowerCase().replace(/<[^>]*>/g, '');
      list = list.filter(item => {
        // Search by constituency name
        if (item.constituency.name.toLowerCase().includes(q)) return true;
        
        // Search by constituency number (seat name like "Dhaka-1")
        const seatName = `${item.constituency.name.split('-')[0]}-${item.constituency.number}`;
        if (seatName.toLowerCase().includes(q)) return true;
        
        // Search by winning party name
        if (item.result?.winnerPartyId) {
          const winnerParty = partyMap[item.result.winnerPartyId];
          if (winnerParty && (
            winnerParty.name.toLowerCase().includes(q) ||
            winnerParty.shortName.toLowerCase().includes(q)
          )) return true;
        }
        
        return false;
      });
    }

    // Sort: completed first, then partial, then counting, then pending
    list.sort((a, b) => {
      const order = { completed: 0, partial: 1, counting: 2, pending: 3 };
      const aOrder = a.result ? order[a.result.status] : 3;
      const bOrder = b.result ? order[b.result.status] : 3;
      return aOrder - bOrder;
    });

    return list;
  }, [constituencies, resultMap, statusFilter, search, partyMap]);

  // Reset visible count / page when filters change
  useEffect(() => {
    if (enablePagination) {
      setCurrentPage(1);
    } else {
      setVisibleCount(INITIAL_RENDER_COUNT);
    }
  }, [statusFilter, search, enablePagination]);

  // PERF: IntersectionObserver-based infinite scroll — loads more as user nears bottom (non-paginated mode only)
  useEffect(() => {
    if (enablePagination) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filtered.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length, enablePagination]);

  // PERF: useCallback for stable handler references
  const handleStatusFilter = useCallback((s: 'all' | 'pending' | 'partial' | 'counting' | 'completed') => {
    setStatusFilter(s);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  // Pagination calculations
  const totalPages = enablePagination ? Math.ceil(filtered.length / itemsPerPage) : 0;
  const visibleItems = enablePagination
    ? filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filtered.slice(0, visibleCount);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div>
      {/* Filters with modern design */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide">
          {(['all', 'completed', 'partial', 'counting', 'pending'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`group relative rounded-full px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-bd-green via-emerald-500 to-emerald-600 dark:from-emerald-600 dark:via-emerald-500 dark:to-emerald-400 text-white shadow-xl scale-105 ring-2 ring-emerald-300 dark:ring-emerald-500/50'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white dark:hover:from-slate-700 dark:hover:to-slate-800 hover:scale-105 hover:border-gray-300 dark:hover:border-slate-600 shadow-md hover:shadow-lg'
              }`}
            >
              {statusFilter === s && (
                <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
              )}
              <span className="relative">{s === 'all' ? 'All' : RESULT_STATUS[s].label}</span>
            </button>
          ))}
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search by name, party, or seat..."
            value={search}
            onChange={handleSearch}
            maxLength={100}
            className="w-full sm:w-80 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-bd-green/50 focus:border-bd-green dark:focus:border-emerald-500 transition-all shadow-sm hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-slate-600"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-bd-green dark:group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* List with enhanced cards */}
      {/* PERF: Progressively rendered list with IntersectionObserver */}
      <div className="space-y-3">
        {visibleItems.map(({ constituency, result }) => (
          <ConstituencyCard
            key={constituency.id}
            constituency={constituency}
            result={result}
            partyMap={partyMap}
          />
        ))}

        {/* Infinite scroll sentinel (non-paginated mode) */}
        {!enablePagination && visibleCount < filtered.length && (
          <div ref={sentinelRef} className="py-4 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-bd-green border-r-transparent" />
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-lg">
              <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-600 dark:text-gray-400 mb-1">No constituencies found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination controls (paginated mode) */}
        {enablePagination && filtered.length > 0 && (
          <div className="mt-6">
            <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Showing {(currentPage - 1) * itemsPerPage + 1}&ndash;{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} constituencies
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}

        {/* Showing-all message (non-paginated mode) */}
        {!enablePagination && visibleCount >= filtered.length && filtered.length > INITIAL_RENDER_COUNT && (
          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-lg">
              <span>Showing all {filtered.length} constituencies</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PERF: Memoized constituency card — only re-renders when its own data changes.
 */
const ConstituencyCard = React.memo(function ConstituencyCard({
  constituency,
  result,
  partyMap,
}: {
  constituency: Constituency;
  result: Result | null;
  partyMap: Record<string, Party>;
}) {
  const winner = result?.winnerPartyId ? partyMap[result.winnerPartyId] : null;
  const status = result?.status || 'pending';
  const { label: statusLabel, color: statusColor } = RESULT_STATUS[status as keyof typeof RESULT_STATUS] || RESULT_STATUS.pending;

  return (
    <Link
      href={`/constituency/${encodeURIComponent(constituency.id)}`}
      className="group block rounded-2xl border-2 border-gray-200/70 dark:border-slate-700/70 bg-gradient-to-r from-white via-white to-gray-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-bd-green/50 dark:hover:border-emerald-500/50 hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-70 group-hover:blur-lg transition-all"
              style={{ backgroundColor: winner?.color || '#E5E7EB' }}
            />
            <span
              className="relative block h-5 w-5 rounded-full shadow-lg group-hover:scale-125 transition-transform ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: winner?.color || '#E5E7EB' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100 truncate group-hover:text-bd-green dark:group-hover:text-emerald-400 transition-colors">
              {constituency.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {winner ? (
                  <span style={{ color: winner.color }} className="font-bold">
                    {getWinnerDisplayName(result!.winnerPartyId, true)}
                  </span>
                ) : (
                  'Awaiting result'
                )}
              </p>
              {result && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{formatNumber(result.totalVotes)} votes</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span className={`flex-shrink-0 rounded-xl px-4 py-2 text-[10px] sm:text-xs font-black ${statusColor} whitespace-nowrap shadow-md group-hover:shadow-xl transition-all group-hover:scale-110`}>
          {statusLabel}
        </span>
      </div>
    </Link>
  );
});

// PERF: Wrap entire component in React.memo
export default React.memo(ConstituencyListInner);
