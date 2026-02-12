'use client';

/* Admin page — protected by Firebase Auth */

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import AdminLogin from '@/components/AdminLogin';
import { PageLoader } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks';

// Dynamic import for AdminPanel - only load when authenticated
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <PageLoader />,
  ssr: false
});

export default function AdminPage() {
  const { adminUser, loading: authLoading, error, login, logout, isAuthenticated } = useAuth();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        {authLoading ? (
          <PageLoader />
        ) : isAuthenticated && adminUser ? (
          <AdminPanel adminUser={adminUser} onLogout={logout} />
        ) : (
          <AdminLogin onLogin={login} error={error} loading={authLoading} />
        )}
      </main>
    </>
  );
}
