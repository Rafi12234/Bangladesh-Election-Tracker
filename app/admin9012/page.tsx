'use client';

/* Admin page — protected by Firebase Auth */

import { useState } from 'react';
import Header from '@/components/Header';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';
import { PageLoader } from '@/components/LoadingSpinner';
import { useAuth, useParties } from '@/hooks';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/constants';
import { divisions, getConstituencyId } from '@/data/divisions';

export default function AdminPage() {
  const { user, adminUser, loading: authLoading, error, login, logout, isAuthenticated } = useAuth();
  const { parties } = useParties();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const seedConstituencies = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      let count = 0;
      // Firestore batch limit is 500, we have ~300 so one batch is enough
      const batch = writeBatch(firestore);

      for (const division of divisions) {
        for (const district of division.districts) {
          for (const num of district.constituencies) {
            const id = getConstituencyId(district.id, num);
            const name = `${district.name}-${num}`;
            const ref = doc(firestore, COLLECTIONS.CONSTITUENCIES, id);
            batch.set(ref, {
              name,
              number: num,
              districtId: district.id,
              districtName: district.name,
              districtBnName: district.bnName,
              divisionId: division.id,
              divisionName: division.name,
              divisionBnName: division.bnName,
              totalVoters: 0,
            });
            count++;
          }
        }
      }

      await batch.commit();
      setSeedMsg(`✅ Successfully saved ${count} constituencies to Firestore!`);
    } catch (err) {
      setSeedMsg(`❌ Error: ${err instanceof Error ? err.message : 'Failed to seed'}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        {authLoading ? (
          <PageLoader />
        ) : isAuthenticated && adminUser ? (
          <>
            {/* Temporary: Seed all constituencies */}
            <div className="mb-6 rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">⚡ Seed All 300 Constituencies to Firestore</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">This will create a document for every constituency (Division → District → Constituency) in the <code>constituencies</code> collection.</p>
              <button
                onClick={seedConstituencies}
                disabled={seeding}
                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {seeding ? 'Saving...' : 'Seed All Constituencies'}
              </button>
              {seedMsg && <p className="mt-2 text-sm">{seedMsg}</p>}
            </div>

            <AdminPanel parties={parties} adminUser={adminUser} onLogout={logout} />
          </>
        ) : (
          <AdminLogin onLogin={login} error={error} loading={authLoading} />
        )}
      </main>
    </>
  );
}
