import { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/LoadingSpinner';

// Dynamic imports for non-critical components
const Header = dynamic(() => import('@/components/Header'), {
  ssr: true,
});

const NewsGrid = dynamic(() => import('@/components/NewsGrid'), {
  loading: () => <PageLoader />,
  ssr: false,
});

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'News - Bangladesh Election Tracker',
  description: 'Latest news and updates from the Bangladesh Parliamentary Election 2026',
  openGraph: {
    title: 'Election News - Bangladesh Election Tracker',
    description: 'Stay updated with the latest news from Bangladesh Parliamentary Election 2026',
  },
};

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                Election News
              </h1>
              <p className="mt-3 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Stay updated with the latest developments, analysis, and reports from the Bangladesh Parliamentary Election 2026.
              </p>
            </div>
          </div>
        </div>

        {/* News Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Suspense fallback={<PageLoader />}>
            <NewsGrid />
          </Suspense>
        </div>
      </main>
    </>
  );
}