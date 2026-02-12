'use client';

/* Constituency list page — client component with filters, search, and pagination */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParties, useResults } from '@/hooks';
import { getConstituencies } from '@/lib/firestore';
import type { Constituency } from '@/types';

// Dynamic imports for better code splitting
const Header = dynamic(() => import('@/components/Header'), {
  ssr: true,
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
});

const ConstituencyList = dynamic(() => import('@/components/ConstituencyList'), {
  loading: () => (
    <div className="animate-pulse space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
  ),
  ssr: false,
});

export default function ConstituencyPageClient() {
  const { parties, loading: pLoading } = useParties();
  const { results, loading: rLoading } = useResults();
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConstituencies()
      .then(setConstituencies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || pLoading || rLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-2 mt-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 mb-2">
            Constituencies
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Browse all {constituencies.length} constituencies and their election results
          </p>
        </div>
        
        <ConstituencyList
          results={results}
          parties={parties}
          constituencies={constituencies}
          enablePagination
          itemsPerPage={20}
        />
      </main>
      <Footer />
    </>
  );
}
