// 'use client';

// MAP PAGE COMMENTED OUT

import Header from '@/components/Header';

export default function MapPage() {
  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Map Feature Disabled
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The constituency map feature is currently unavailable.
          </p>
        </div>
      </div>
    </>
  );
}
