'use client';

/* Landing page — Main dashboard showing election summary, seat counts,
   popular vote percentages, and a constituency list. */

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParties, useResults, useSummary } from '@/hooks';
import { getConstituencies } from '@/lib/firestore';
import { aggregateAllianceSeatCounts } from '@/lib/alliances';
import type { Constituency, SeatCount } from '@/types';
import ResultsSummary from '@/components/ResultsSummary';

// Dynamic imports for non-critical components only
const Header = dynamic(() => import('@/components/Header'), {
  ssr: true
});

const ElectionBanner = dynamic(() => import('@/components/ElectionBanner'), {
  ssr: true
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false
});

// PERF: Lazy load constituency list only when scrolled into view
const ConstituencyList = dynamic(() => import('@/components/ConstituencyList'), {
  loading: () => (
    <div className="animate-pulse space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
  ),
  ssr: false
});

export default function HomePage() {
  const { parties } = useParties();
  const { results } = useResults();
  const { summary } = useSummary(results);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [cLoading, setCLoading] = useState(false);
  const [shouldLoadConstituencies, setShouldLoadConstituencies] = useState(false);
  const constituencyRef = useRef<HTMLDivElement>(null);

  // PERF: Lazy load constituencies only when section is visible
  useEffect(() => {
    if (!constituencyRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadConstituencies(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(constituencyRef.current);
    return () => observer.disconnect();
  }, []);

  // PERF: Fetch constituencies only when needed
  useEffect(() => {
    if (!shouldLoadConstituencies) return;

    setCLoading(true);
    const timeoutId = setTimeout(() => {
      console.warn('Constituency loading taking too long, using fallback');
      setCLoading(false);
    }, 5000);

    getConstituencies()
      .then(setConstituencies)
      .catch(err => {
        console.error('Failed to load constituencies:', err);
        setConstituencies([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setCLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, [shouldLoadConstituencies]);

  // Compute seat counts locally — no extra hooks / Firestore subscriptions
  const seatCounts = useMemo((): SeatCount[] => {
    const counts: Record<string, SeatCount> = {};
    parties.forEach(p => {
      counts[p.id] = { partyId: p.id, partyName: p.shortName, partyColor: p.color, seats: 0, leadingSeats: 0, totalVotes: 0, votePercentage: 0 };
    });
    let totalVotes = 0;
    results.forEach(r => {
      Object.entries(r.partyVotes).forEach(([pid, v]) => { if (counts[pid]) counts[pid].totalVotes += v; totalVotes += v; });
      if (r.status === 'completed' && r.winnerPartyId && counts[r.winnerPartyId]) counts[r.winnerPartyId].seats++;
      else if (r.status === 'partial') { const l = Object.entries(r.partyVotes).sort(([,a],[,b]) => b - a)[0]; if (l && counts[l[0]]) counts[l[0]].leadingSeats++; }
    });
    return Object.values(counts).map(sc => ({ ...sc, votePercentage: totalVotes > 0 ? (sc.totalVotes / totalVotes) * 100 : 0 }))
      .filter(sc => sc.seats > 0 || sc.leadingSeats > 0 || sc.totalVotes > 0)
      .sort((a, b) => b.seats - a.seats || b.totalVotes - a.totalVotes);
  }, [results, parties]);

  const allianceSeatCounts = useMemo(() => aggregateAllianceSeatCounts(results), [results]);

  return (
    <>
      <Header />
      <ElectionBanner />
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="space-y-8">
          {/* Results summary loads instantly and updates with data as it arrives */}
          <ResultsSummary summary={summary} seatCounts={seatCounts} allianceSeatCounts={allianceSeatCounts} />

          {/* PERF: Lazy-loaded constituency section with intersection observer */}
          <section ref={constituencyRef}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Constituencies</h2>
              <Link 
                href="/constituency" 
                className="text-sm font-medium text-bd-green dark:text-emerald-400 hover:underline"
              >
                View All →
              </Link>
            </div>
            
            {!shouldLoadConstituencies ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Scroll down to load constituencies...</p>
              </div>
            ) : cLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-bd-green border-r-transparent" />
              </div>
            ) : (
              <ConstituencyList 
                results={results} 
                parties={parties} 
                constituencies={constituencies} 
                enablePagination 
                itemsPerPage={10}
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
