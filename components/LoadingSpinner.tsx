'use client';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${dims} animate-spin rounded-full border-2 border-gray-200 dark:border-slate-700 border-t-bd-green dark:border-t-emerald-400`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-200 dark:border-slate-700 border-t-bd-green dark:border-t-emerald-400" />
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading election data...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}
