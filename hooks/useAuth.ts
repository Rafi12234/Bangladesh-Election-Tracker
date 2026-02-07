'use client';

// Authentication hook for admin panel

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { signIn, signOut, onAuthChange } from '@/lib/auth';
import type { AdminUser } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setError(null);

      if (firebaseUser) {
        setUser(firebaseUser);
        // Build admin object instantly from Firebase Auth — no Firestore round-trip
        setAdminUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email || 'Admin',
          role: 'admin',
          assignedDivisions: [],
          createdAt: new Date(),
        });
      } else {
        setUser(null);
        setAdminUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err: any) {
      const code = err?.code || '';
      let message = 'Login failed. Please try again.';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    adminUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!adminUser,
  };
}
