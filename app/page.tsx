'use client';

/* Landing page — Main dashboard showing election summary, seat counts,
   popular vote percentages, and a constituency list. */

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ElectionEditorialHeader from '@/components/ElectionEditorialHeader';
import ResultsSummary from '@/components/ResultsSummary';
import ElectionResultsBar from '@/components/ElectionResultsBar';
import ConstituencyList from '@/components/ConstituencyList';
import { PageLoader } from '@/components/LoadingSpinner';
import { useParties, useResults, useSummary, useSeatCounts, useAllianceSeatCounts } from '@/hooks';
import { getConstituencies } from '@/lib/firestore';
import { UPCOMING_ELECTION } from '@/lib/constants';
import type { Constituency } from '@/types';

// Lazy-load map to reduce initial bundle
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-[500px] sm:h-[550px] lg:h-[650px] skeleton rounded-lg" />,
});

export default function HomePage() {
  const { parties, loading: partiesLoading } = useParties();
  const { results, loading: resultsLoading } = useResults();
  const { summary, loading: summaryLoading } = useSummary();
  const { seatCounts } = useSeatCounts();
  const { allianceSeatCounts } = useAllianceSeatCounts();
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [consLoading, setConsLoading] = useState(true);

  // Mock data for ElectionResultsBar - replace with real data later
  const mockElectionData = {
    left: {
      partyName: "Bangladesh Nationalist Party",
      shortName: "BNP",
      leaderName: "Khaleda Zia",
      seatCount: 127,
      partyColor: "#E4002B",
      logoUrl: "/bnp.png",
      popularVotePct: 42.8,
      popularVotes: 25640000
    },
    right: {
      partyName: "Jamaat-e-Islami",
      shortName: "Jamaat",
      leaderName: "Dr. Shafiqur Rahman",
      seatCount: 89,
      partyColor: "#006400",
      logoUrl: "/jamaat.png",
      popularVotePct: 31.5,
      popularVotes: 18920000
    },
    totalSeats: 300,
    seatsToWin: 151
  };

  useEffect(() => {
    getConstituencies()
      .then(setConstituencies)
      .catch(console.error)
      .finally(() => setConsLoading(false));
  }, []);

  const loading = partiesLoading || resultsLoading || summaryLoading;

  return (
    <>
      <Header />
      <ElectionEditorialHeader data={UPCOMING_ELECTION} />
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        {loading ? (
          <PageLoader />
        ) : (
          <div className="space-y-8">
            {/* Election summary + metrics */}
            <ResultsSummary summary={summary} seatCounts={seatCounts} allianceSeatCounts={allianceSeatCounts} />

            {/* Election Results Comparison Bar */}
            <ElectionResultsBar {...mockElectionData} />

            {/* Mini map preview */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Live Map</h2>
                <a href="/map" className="text-sm font-medium text-bd-green dark:text-emerald-400 hover:underline flex items-center gap-1">
                  View Full Map
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              <div className="h-[500px] sm:h-[550px] lg:h-[650px] overflow-hidden rounded-xl shadow-soft-lg">
                <MapView results={results} parties={parties} />
              </div>
            </section>

            {/* Constituency list */}
            <section>
              <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-gray-100">Constituencies</h2>
              {consLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-lg" />
                  ))}
                </div>
              ) : (
                <ConstituencyList results={results} parties={parties} constituencies={constituencies} />
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
