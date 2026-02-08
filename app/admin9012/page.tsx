'use client';

/* Admin page — protected by Firebase Auth */

import Header from '@/components/Header';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';
import { PageLoader } from '@/components/LoadingSpinner';
import { useAuth, useParties } from '@/hooks';

export default function AdminPage() {
  const { user, adminUser, loading: authLoading, error, login, logout, isAuthenticated } = useAuth();
  const { parties } = useParties();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        {authLoading ? (
          <PageLoader />
        ) : isAuthenticated && adminUser ? (
          <AdminPanel parties={parties} adminUser={adminUser} onLogout={logout} />
        ) : (
          <AdminLogin onLogin={login} error={error} loading={authLoading} />
        )}
      </main>
    </>
  );
}
