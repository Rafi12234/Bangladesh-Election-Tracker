'use client';

/* Admin Result Entry Panel
   Shows all 300 constituencies in a searchable list grouped by division/district.
   Click any constituency to expand and enter vote results. */

import { useState, useMemo, useCallback, type FormEvent } from 'react';
import type { Party, AdminUser, Result } from '@/types';
import { divisions, getConstituencyId, getConstituencyName } from '@/data/divisions';
import { saveResult, getResultByConstituency } from '@/lib/firestore';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { getAllSelectableParties, getIndependentOption } from '@/data/parties';

interface Props {
  parties: Party[];
  adminUser: AdminUser;
  onLogout: () => void;
}

interface VoteInput {
  partyId: string;
  votes: number;
}

interface ConstituencyItem {
  id: string;
  name: string;
  number: number;
  districtId: string;
  districtName: string;
  divisionId: string;
  divisionName: string;
}

function buildConstituencyList(): ConstituencyItem[] {
  const list: ConstituencyItem[] = [];
  for (const div of divisions) {
    for (const dist of div.districts) {
      for (const num of dist.constituencies) {
        list.push({
          id: getConstituencyId(dist.id, num),
          name: getConstituencyName(dist.id, num),
          number: num,
          districtId: dist.id,
          districtName: dist.name,
          divisionId: div.id,
          divisionName: div.name,
        });
      }
    }
  }
  return list;
}

const ALL_CONSTITUENCIES = buildConstituencyList();

export default function AdminPanel({ parties, adminUser, onLogout }: Props) {
  const allParties = useMemo(() => {
    const selectableParties = getAllSelectableParties();
    const independent = getIndependentOption();
    return independent ? [...selectableParties, independent] : selectableParties;
  }, []);

  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [voteInputs, setVoteInputs] = useState<VoteInput[]>([]);
  const [status, setStatus] = useState<'partial' | 'completed'>('partial');
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingResult, setExistingResult] = useState<Result | null>(null);

  const filtered = useMemo(() => {
    let list = ALL_CONSTITUENCIES;
    if (filterDivision) list = list.filter(c => c.divisionId === filterDivision);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.districtName.toLowerCase().includes(q) ||
        c.divisionName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, filterDivision]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, ConstituencyItem[]>>();
    for (const c of filtered) {
      if (!map.has(c.divisionName)) map.set(c.divisionName, new Map());
      const distMap = map.get(c.divisionName)!;
      if (!distMap.has(c.districtName)) distMap.set(c.districtName, []);
      distMap.get(c.districtName)!.push(c);
    }
    return map;
  }, [filtered]);

  const selectConstituency = useCallback(async (c: ConstituencyItem) => {
    if (activeId === c.id) {
      setActiveId(null);
      setVoteInputs([]);
      setExistingResult(null);
      setMessage(null);
      return;
    }

    setActiveId(c.id);
    setLoadingId(c.id);
    setMessage(null);

    try {
      const result = await getResultByConstituency(c.id);
      setExistingResult(result);
      setVoteInputs(allParties.map(p => ({ partyId: p.id, votes: result?.partyVotes[p.id] || 0 })));
      if (result?.status) setStatus(result.status as 'partial' | 'completed');
      else setStatus('partial');
    } catch {
      setVoteInputs(allParties.map(p => ({ partyId: p.id, votes: 0 })));
      setExistingResult(null);
      setStatus('partial');
    } finally {
      setLoadingId(null);
    }
  }, [activeId, allParties]);

  const updateVote = (partyId: string, value: string) => {
    const votes = parseInt(value, 10) || 0;
    setVoteInputs(prev => prev.map(v => (v.partyId === partyId ? { ...v, votes } : v)));
  };

  const totalVotes = useMemo(() => voteInputs.reduce((s, v) => s + v.votes, 0), [voteInputs]);

  const calculated = useMemo(() => {
    const sorted = [...voteInputs].sort((a, b) => b.votes - a.votes);
    const winnerId = sorted[0]?.votes > 0 ? sorted[0].partyId : null;
    const margin = sorted.length >= 2 ? sorted[0].votes - sorted[1].votes : sorted[0]?.votes || 0;
    return { winnerId, margin };
  }, [voteInputs]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeId) return;

    setSaving(true);
    setMessage(null);

    try {
      const partyVotes: Record<string, number> = {};
      voteInputs.forEach(v => { partyVotes[v.partyId] = v.votes; });

      await saveResult({
        constituencyId: activeId,
        partyVotes,
        status,
        adminUid: adminUser.uid,
      });

      const name = ALL_CONSTITUENCIES.find(c => c.id === activeId)?.name || activeId;
      setMessage({ type: 'success', text: `Result saved for ${name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Admin header */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Result Entry</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Logged in as {adminUser.displayName || adminUser.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          Sign Out
        </button>
      </div>

      {/* Search & filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search constituency, district..."
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-bd-green dark:focus:border-emerald-400 focus:ring-2 focus:ring-bd-green/20 dark:focus:ring-emerald-400/20 transition-all"
          />
        </div>
        <select
          value={filterDivision}
          onChange={e => setFilterDivision(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-bd-green dark:focus:border-emerald-400 focus:ring-2 focus:ring-bd-green/20 dark:focus:ring-emerald-400/20 transition-all"
        >
          <option value="">All Divisions</option>
          {divisions.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <span className="self-center text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {filtered.length} seats
        </span>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm border ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Constituency list grouped by division → district */}
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([divName, distMap]) => (
          <div key={divName} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-soft overflow-hidden">
            {/* Division header */}
            <div className="bg-bd-green/5 dark:bg-emerald-900/20 px-5 py-3 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-bd-green dark:text-emerald-400 uppercase tracking-wide">{divName} Division</h2>
            </div>

            {Array.from(distMap.entries()).map(([distName, constituencies]) => (
              <div key={distName}>
                <div className="px-5 py-2 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {distName} District
                    <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal">({constituencies.length} seats)</span>
                  </h3>
                </div>

                <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {constituencies.map(c => {
                    const isActive = activeId === c.id;
                    const isLoading = loadingId === c.id;

                    return (
                      <div key={c.id}>
                        <button
                          type="button"
                          onClick={() => selectConstituency(c)}
                          className={`w-full flex items-center justify-between px-5 py-3 text-left transition-all ${
                            isActive
                              ? 'bg-bd-green/5 dark:bg-emerald-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                              isActive
                                ? 'bg-bd-green text-white'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              {c.number}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLoading && (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-bd-green" />
                            )}
                            <svg className={`h-4 w-4 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isActive && !isLoading && (
                          <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
                            {existingResult && (
                              <div className="px-5 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50/50 dark:bg-amber-900/10">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Existing result — editing will overwrite
                              </div>
                            )}

                            <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
                              {allParties.map(party => {
                                const input = voteInputs.find(v => v.partyId === party.id);
                                const votes = input?.votes || 0;
                                const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                                const isLeading = calculated.winnerId === party.id && votes > 0;

                                return (
                                  <div
                                    key={party.id}
                                    className={`flex items-center gap-3 px-5 py-2.5 ${
                                      isLeading ? 'bg-green-50/50 dark:bg-emerald-900/10' : ''
                                    }`}
                                  >
                                    <span className="text-base">{party.symbol}</span>
                                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: party.color }} />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate block">
                                        {party.shortName}
                                        {isLeading && <span className="ml-1.5 text-green-600 dark:text-emerald-400">● Leading</span>}
                                      </span>
                                    </div>
                                    <input
                                      type="number"
                                      min="0"
                                      value={votes || ''}
                                      onChange={e => updateVote(party.id, e.target.value)}
                                      placeholder="0"
                                      className="w-24 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none focus:border-bd-green dark:focus:border-emerald-400 focus:ring-1 focus:ring-bd-green/20 transition-all"
                                    />
                                    <span className="w-12 text-right text-xs text-gray-400">{formatPercentage(pct)}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Total: <strong className="text-gray-900 dark:text-gray-100">{formatNumber(totalVotes)}</strong>
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Winner: <strong style={{ color: allParties.find(p => p.id === calculated.winnerId)?.color }}>
                                    {allParties.find(p => p.id === calculated.winnerId)?.shortName || '—'}
                                  </strong>
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Margin: <strong className="text-gray-900 dark:text-gray-100">{formatNumber(calculated.margin)}</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:ml-auto">
                                <select
                                  value={status}
                                  onChange={e => setStatus(e.target.value as 'partial' | 'completed')}
                                  className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-bd-green dark:focus:border-emerald-400 transition-all"
                                >
                                  <option value="partial">Counting</option>
                                  <option value="completed">Declared</option>
                                </select>
                                <button
                                  type="submit"
                                  disabled={saving || totalVotes === 0}
                                  className="rounded-md bg-bd-green dark:bg-emerald-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-bd-green/90 dark:hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                >
                                  {saving ? 'Saving...' : existingResult ? 'Update' : 'Save'}
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No constituencies match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
