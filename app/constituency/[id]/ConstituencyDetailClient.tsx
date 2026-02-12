'use client';

/* Constituency detail page — full breakdown (client component)
 * PERF: Memoized party lookups and vote entries to reduce re-renders */

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { PageLoader } from '@/components/LoadingSpinner';
import { useParties, useConstituencyResult } from '@/hooks';
import { RESULT_STATUS } from '@/lib/constants';
import { getRelativeTime } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { getConstituencyById } from '@/lib/firestore';
import type { Constituency } from '@/types';

export default function ConstituencyDetailClient({ id: rawId }: { id: string }) {
  const router = useRouter();

  // Decode URL-encoded constituency ID (e.g., "cox's%20bazar-1" -> "cox's bazar-1")
  const id = rawId ? decodeURIComponent(rawId) : '';

  const { parties } = useParties();
  const { result, candidates, loading } = useConstituencyResult(id);
  const [constituency, setConstituency] = useState<Constituency | null>(null);

  useEffect(() => {
    if (id) {
      getConstituencyById(id).then(setConstituency).catch(console.error);
    }
  }, [id]);

  // PERF: Memoize party lookup map to avoid rebuilding on every render
  const partyMap = useMemo(() => Object.fromEntries(parties.map(p => [p.id, p])), [parties]);

  const status = result?.status || 'pending';
  const statusInfo = RESULT_STATUS[status as keyof typeof RESULT_STATUS] || RESULT_STATUS.pending;
  const winnerParty = result?.winnerPartyId ? partyMap[result.winnerPartyId] : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-5 flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {loading ? (
          <PageLoader />
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 break-words">
                    {constituency?.name || decodeURIComponent(id || '')}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Constituency #{constituency?.number || ''}
                  </p>
                </div>
                <span className={`rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-semibold ${statusInfo.color} whitespace-nowrap flex-shrink-0 shadow-sm`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Winner highlight */}
              {winnerParty && result && (
                <div
                  className="mt-4 rounded-lg border-l-4 p-3.5 sm:p-4 shadow-sm"
                  style={{ borderLeftColor: winnerParty.color, backgroundColor: winnerParty.color + '15' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl">{winnerParty.symbol}</span>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold truncate" style={{ color: winnerParty.color }}>
                        {winnerParty.name} {status === 'completed' ? 'wins' : 'leading'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!winnerParty && (
                <div className="mt-4 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-4 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Result not yet declared</p>
                </div>
              )}
            </div>

            {/* Candidates list */}
            {candidates.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
                <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">Candidates</h2>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {candidates.map(c => {
                    const party = partyMap[c.partyId];
                    const isWinner = result?.winnerPartyId === c.partyId;
                    return (
                      <div key={c.id} className={`flex items-center justify-between py-3 first:pt-0 last:pb-0 ${isWinner ? 'bg-green-50/50 dark:bg-emerald-900/10 -mx-2 px-2 rounded-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3.5 w-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: party?.color || '#6B7280' }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {c.name}
                              {isWinner && <span className="ml-2 text-green-600 dark:text-emerald-400 text-xs font-bold">✓ Winner</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{party?.name || c.partyId}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Updated at */}
            {result?.updatedAt && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                Updated {getRelativeTime(result.updatedAt)}
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}

