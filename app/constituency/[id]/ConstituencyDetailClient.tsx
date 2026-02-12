'use client';

/* Constituency detail page — full breakdown (client component)
 * PERF: Memoized party lookups and vote entries to reduce re-renders */

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import VoteBar from '@/components/VoteBar';
import { PageLoader } from '@/components/LoadingSpinner';
import { useParties, useConstituencyResult } from '@/hooks';
import { RESULT_STATUS } from '@/lib/constants';
import { formatNumber, formatPercentage, getRelativeTime, calculatePercentage } from '@/lib/utils';
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

  // PERF: Memoize vote entries to avoid recalculating on every render
  const voteEntries = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.partyVotes)
      .filter(([, votes]) => votes > 0)
      .map(([partyId, votes]) => {
        const party = partyMap[partyId];
        const candidate = candidates.find(c => c.partyId === partyId);
        return {
          partyId,
          partyName: party?.shortName || partyId,
          partyColor: party?.color || '#6B7280',
          candidateName: candidate?.name || 'Unknown',
          votes,
          percentage: calculatePercentage(votes, result.totalVotes),
          isWinner: result.winnerPartyId === partyId,
        };
      })
      .sort((a, b) => b.votes - a.votes);
  }, [result, partyMap, candidates]);

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
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Margin: {formatNumber(result.margin)} ({formatPercentage(result.marginPercentage)})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key stats */}
            {result && (
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Total Votes" value={formatNumber(result.totalVotes)} />
                <StatCard label="Margin" value={formatNumber(result.margin)} />
              </div>
            )}

            {/* Vote breakdown or candidates */}
            {voteEntries.length > 0 ? (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
                <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">Vote Breakdown</h2>
                <VoteBar entries={voteEntries} />
              </div>
            ) : candidates.length > 0 ? (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
                <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">Candidates</h2>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {candidates.map(c => {
                    const party = partyMap[c.partyId];
                    const votes = result?.partyVotes[c.partyId] || 0;
                    return (
                      <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3.5 w-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: party?.color || '#6B7280' }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{party?.name || c.partyId}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(votes)}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">Votes will appear here once counting begins</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-12 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No candidate data available</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">This constituency may not have candidate information yet</p>
              </div>
            )}

            {/* Additional info if both votes and candidates exist */}
            {voteEntries.length > 0 && candidates.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
                <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">All Candidates</h2>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {candidates.map(c => {
                    const party = partyMap[c.partyId];
                    const votes = result?.partyVotes[c.partyId] || 0;
                    return (
                      <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3.5 w-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: party?.color || '#6B7280' }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{party?.name || c.partyId}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(votes)}</span>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 text-center shadow-soft">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );
}
