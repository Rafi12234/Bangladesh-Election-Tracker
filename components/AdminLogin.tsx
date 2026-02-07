'use client';

/* Admin login form — Firebase email/password authentication */

import { useState, type FormEvent } from 'react';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export default function AdminLogin({ onLogin, error, loading }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch {
      // error is handled by parent via useAuth hook
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-soft-lg"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Login</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Sign in to enter election results</p>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>
        )}

        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 shadow-sm outline-none focus:border-bd-green dark:focus:border-emerald-400 focus:ring-2 focus:ring-bd-green/20 dark:focus:ring-emerald-400/20 transition-all"
          placeholder="admin@example.com"
          autoComplete="email"
        />

        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 shadow-sm outline-none focus:border-bd-green dark:focus:border-emerald-400 focus:ring-2 focus:ring-bd-green/20 dark:focus:ring-emerald-400/20 transition-all"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-bd-green dark:bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-bd-green/90 dark:hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
