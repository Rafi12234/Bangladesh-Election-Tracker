'use client';

/* Admin Result Entry Panel
   Fetches all constituencies from Firebase collection: constituencies.
   Each doc ID = constituency name (lowercase). Each doc has a `candidates` array
   where each element has { candidateName, party, symbol }.
   Grouped by district using the static divisions data for name lookups. */

import { useState, useMemo, useCallback, useEffect, type FormEvent } from 'react';
import type { Party, AdminUser, Result } from '@/types';
import { divisions } from '@/data/divisions';
import { saveResult, getResultByConstituency, getAllConstituencyDocuments } from '@/lib/firestore';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { getPartyById } from '@/data/parties';

interface Props {
  parties: Party[];
  adminUser: AdminUser;
  onLogout: () => void;
}

interface VoteInput {
  partyId: string;
  votes: number;
}

interface CandidateEntry {
  party: string;
  candidateName: string;
  symbol: string;
  color: string;
}

interface FirebaseConstituency {
  id: string;            // doc ID from Firebase (e.g., "dhaka-1")
  displayName: string;   // prettified name (e.g., "Dhaka-1")
  districtId: string;    // extracted district part (e.g., "dhaka")
  districtName: string;  // looked up from divisions.ts
  divisionId: string;
  divisionName: string;
  number: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: Record<string, any>;
}

// Build a lookup map: districtId → { districtName, divisionId, divisionName }
const DISTRICT_MAP = new Map<string, { districtName: string; divisionId: string; divisionName: string }>();
for (const div of divisions) {
  for (const dist of div.districts) {
    DISTRICT_MAP.set(dist.id, {
      districtName: dist.name,
      divisionId: div.id,
      divisionName: div.name,
    });
  }
}

function parseConstituencyId(docId: string): { districtId: string; number: number } {
  // Doc IDs are like "dhaka-1", "coxs-bazar-2", etc.
  const lastDash = docId.lastIndexOf('-');
  if (lastDash === -1) return { districtId: docId, number: 0 };
  const numPart = docId.slice(lastDash + 1);
  const num = parseInt(numPart, 10);
  if (isNaN(num)) return { districtId: docId, number: 0 };
  return { districtId: docId.slice(0, lastDash), number: num };
}

function prettifyName(docId: string): string {
  const { districtId, number } = parseConstituencyId(docId);
  const info = DISTRICT_MAP.get(districtId);
  if (info) return `${info.districtName}-${number}`;
  // Fallback: capitalize first letter of each word
  return docId.replace(/(^|-)(\w)/g, (_, sep, ch) => (sep === '-' ? '-' : '') + ch.toUpperCase());
}

export default function AdminPanel({ parties, adminUser, onLogout }: Props) {
  const [allConstituencies, setAllConstituencies] = useState<FirebaseConstituency[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateEntry[]>([]);
  const [voteInputs, setVoteInputs] = useState<VoteInput[]>([]);
  const [status, setStatus] = useState<'partial' | 'completed'>('partial');
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingResult, setExistingResult] = useState<Result | null>(null);

  // Fetch all constituency docs from Firebase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const docs = await getAllConstituencyDocuments();
        if (cancelled) return;

        const parsed: FirebaseConstituency[] = docs.map(d => {
          const { districtId, number } = parseConstituencyId(d.id);
          const info = DISTRICT_MAP.get(districtId);
          return {
            id: d.id,
            displayName: prettifyName(d.id),
            districtId,
            districtName: info?.districtName || districtId,
            divisionId: info?.divisionId || '',
            divisionName: info?.divisionName || '',
            number,
            rawData: d.data,
          };
        });

        // Sort by divisionName → districtName → number
        parsed.sort((a, b) =>
          a.divisionName.localeCompare(b.divisionName) ||
          a.districtName.localeCompare(b.districtName) ||
          a.number - b.number
        );

        setAllConstituencies(parsed);
      } catch (err) {
        console.error('Failed to fetch constituencies:', err);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = allConstituencies;
    if (filterDivision) list = list.filter(c => c.divisionId === filterDivision);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.displayName.toLowerCase().includes(q) ||
        c.districtName.toLowerCase().includes(q) ||
        c.divisionName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, filterDivision, allConstituencies]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, FirebaseConstituency[]>>();
    for (const c of filtered) {
      const divKey = c.divisionName || 'Unknown Division';
      const distKey = c.districtName || 'Unknown District';
      if (!map.has(divKey)) map.set(divKey, new Map());
      const distMap = map.get(divKey)!;
      if (!distMap.has(distKey)) distMap.set(distKey, []);
      distMap.get(distKey)!.push(c);
    }
    return map;
  }, [filtered]);

  const selectConstituency = useCallback((c: FirebaseConstituency) => {
    if (activeId === c.id) {
      setActiveId(null);
      setCandidates([]);
      setVoteInputs([]);
      setExistingResult(null);
      setMessage(null);
      return;
    }

    setActiveId(c.id);
    setLoadingId(c.id);
    setMessage(null);

    // Read candidates from the already-fetched rawData
    const entries: CandidateEntry[] = [];
    const candidatesArr = c.rawData.candidates;

    if (Array.isArray(candidatesArr)) {
      for (const item of candidatesArr) {
        const partyKey = (item.party || '').toString();
        const staticParty = getPartyById(partyKey);
        entries.push({
          party: item.party || staticParty?.shortName || partyKey || 'Unknown',
          candidateName: item.candidateName || item.name || '',
          symbol: item.symbol || staticParty?.symbol || '',
          color: staticParty?.color || '#6B7280',
        });
      }
    }

    setCandidates(entries);

    // Fetch existing result for vote counts
    getResultByConstituency(c.id)
      .then(result => {
        setExistingResult(result);
        setVoteInputs(entries.map(e => ({
          partyId: e.party,
          votes: result?.partyVotes[e.party] || 0,
        })));
        if (result?.status) setStatus(result.status as 'partial' | 'completed');
        else setStatus('partial');
      })
      .catch(() => {
        setVoteInputs(entries.map(e => ({ partyId: e.party, votes: 0 })));
        setExistingResult(null);
        setStatus('partial');
      })
      .finally(() => setLoadingId(null));
  }, [activeId]);

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

      const name = allConstituencies.find(c => c.id === activeId)?.displayName || activeId;
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

      {/* Loading state */}
      {loadingList && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-300 border-t-bd-green" />
          <span className="ml-3 text-sm text-gray-500">Loading constituencies from Firebase...</span>
        </div>
      )}

      {/* Constituency list grouped by division → district */}
      {!loadingList && (
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
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.displayName}</span>
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
                              {candidates.length === 0 ? (
                                <div className="px-5 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                                  No candidates found in this constituency.
                                </div>
                              ) : candidates.map((candidate, idx) => {
                                const input = voteInputs.find(v => v.partyId === candidate.party);
                                const votes = input?.votes || 0;
                                const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                                const isLeading = calculated.winnerId === candidate.party && votes > 0;

                                return (
                                  <div
                                    key={`${candidate.party}-${idx}`}
                                    className={`flex items-center gap-3 px-5 py-2.5 ${
                                      isLeading ? 'bg-green-50/50 dark:bg-emerald-900/10' : ''
                                    }`}
                                  >
                                    <span className="text-base">{candidate.symbol}</span>
                                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.color }} />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate block">
                                        {candidate.party}
                                        {isLeading && <span className="ml-1.5 text-green-600 dark:text-emerald-400">● Leading</span>}
                                      </span>
                                      {candidate.candidateName && (
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate block">{candidate.candidateName}</span>
                                      )}
                                    </div>
                                    <input
                                      type="number"
                                      min="0"
                                      value={votes || ''}
                                      onChange={e => updateVote(candidate.party, e.target.value)}
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
                                  Winner: <strong style={{ color: candidates.find(cd => cd.party === calculated.winnerId)?.color }}>
                                    {candidates.find(cd => cd.party === calculated.winnerId)?.party || '—'}
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

        {filtered.length === 0 && !loadingList && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No constituencies match your search.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
