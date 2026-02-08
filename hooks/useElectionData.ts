'use client';

// Custom hooks for election data with real-time subscriptions

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getParties,
  getResults,
  getConstituencies,
  getCandidatesByConstituency,
  getResultByConstituency,
  subscribeToResults,
  subscribeToSummary,
  subscribeToResult,
} from '@/lib/firestore';
import type {
  Party,
  Result,
  Constituency,
  Candidate,
  ElectionSummary,
  SeatCount,
  AllianceSeatCount,
} from '@/types';
import { ELECTION_CONFIG } from '@/lib/constants';
import { parties as staticParties } from '@/data/parties';
import { aggregateAllianceSeatCounts } from '@/lib/alliances';

// ============================================
// useParties - Get all parties
// ============================================
export function useParties() {
  const [parties, setParties] = useState<Party[]>(staticParties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getParties()
      .then(data => { if (data.length) setParties(data); })
      .catch(err => {
        console.error('Failed to fetch parties:', err);
      });
  }, []);

  return { parties, loading, error };
}

// ============================================
// useResults - Real-time results subscription
// ============================================
export function useResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Real-time subscription handles both initial load and updates
    const unsubscribe = subscribeToResults(setResults);
    return () => unsubscribe();
  }, []);

  return { results, loading, error };
}

// ============================================
// useSummary - Real-time election summary
// ============================================
export function useSummary() {
  const [summary, setSummary] = useState<ElectionSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSummary(setSummary);
    return () => unsubscribe();
  }, []);

  // Compute summary from results if not available
  const computedSummary = useMemo((): ElectionSummary => {
    if (summary) return summary;

    return {
      totalSeats: ELECTION_CONFIG.TOTAL_SEATS,
      declaredSeats: 0,
      requiredMajority: ELECTION_CONFIG.MAJORITY_SEATS,
      partySeatCounts: [],
      totalVotesCast: 0,
      averageTurnout: 0,
      lastUpdated: new Date(),
    };
  }, [summary]);

  return { summary: computedSummary, loading };
}

// ============================================
// useConstituencyResult - Single constituency
// ============================================
export function useConstituencyResult(constituencyId: string | null) {
  const [result, setResult] = useState<Result | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!constituencyId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch candidates
    getCandidatesByConstituency(constituencyId)
      .then(setCandidates)
      .catch(console.error);

    // Subscribe to result
    const unsubscribe = subscribeToResult(constituencyId, data => {
      setResult(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [constituencyId]);

  return { result, candidates, loading };
}

// ============================================
// useSeatCounts - Aggregated seat counts
// ============================================
export function useSeatCounts() {
  const { results } = useResults();
  const { parties } = useParties();

  const seatCounts = useMemo((): SeatCount[] => {
    const counts: Record<string, SeatCount> = {};

    // Initialize for all parties
    parties.forEach(party => {
      counts[party.id] = {
        partyId: party.id,
        partyName: party.shortName,
        partyColor: party.color,
        seats: 0,
        leadingSeats: 0,
        totalVotes: 0,
        votePercentage: 0,
      };
    });

    let totalVotes = 0;

    // Process results
    results.forEach(result => {
      // Add party votes
      Object.entries(result.partyVotes).forEach(([partyId, votes]) => {
        if (counts[partyId]) {
          counts[partyId].totalVotes += votes;
        }
        totalVotes += votes;
      });

      // Count seats
      if (result.status === 'completed' && result.winnerPartyId) {
        if (counts[result.winnerPartyId]) {
          counts[result.winnerPartyId].seats++;
        }
      } else if (result.status === 'partial') {
        const leader = Object.entries(result.partyVotes).sort(
          ([, a], [, b]) => b - a
        )[0];
        if (leader && counts[leader[0]]) {
          counts[leader[0]].leadingSeats++;
        }
      }
    });

    // Calculate percentages and filter
    return Object.values(counts)
      .map(sc => ({
        ...sc,
        votePercentage: totalVotes > 0 ? (sc.totalVotes / totalVotes) * 100 : 0,
      }))
      .filter(sc => sc.seats > 0 || sc.leadingSeats > 0 || sc.totalVotes > 0)
      .sort((a, b) => b.seats - a.seats || b.totalVotes - a.totalVotes);
  }, [results, parties]);

  return { seatCounts };
}

// ============================================
// useAllianceSeatCounts - Aggregated alliance seat counts
// ============================================
export function useAllianceSeatCounts() {
  const { results } = useResults();

  const allianceSeatCounts = useMemo((): AllianceSeatCount[] => {
    return aggregateAllianceSeatCounts(results);
  }, [results]);

  return { allianceSeatCounts };
}

// ============================================
// useMapData - Data for map coloring
// ============================================
export function useMapData() {
  const { results } = useResults();
  const { parties } = useParties();

  const colorMap = useMemo(() => {
    const map: Record<string, { color: string; party: string; status: string }> = {};

    results.forEach(result => {
      let color = '#E5E7EB'; // Default gray
      let partyName = 'Pending';

      if (result.status === 'completed' && result.winnerPartyId) {
        const party = parties.find(p => p.id === result.winnerPartyId);
        if (party) {
          color = party.color;
          partyName = party.shortName;
        }
      } else if (result.status === 'partial') {
        const leader = Object.entries(result.partyVotes).sort(
          ([, a], [, b]) => b - a
        )[0];
        if (leader) {
          const party = parties.find(p => p.id === leader[0]);
          if (party) {
            // Lighter shade for leading
            color = party.color + '80'; // 50% opacity
            partyName = `${party.shortName} (Leading)`;
          }
        }
      }

      map[result.constituencyId] = {
        color,
        party: partyName,
        status: result.status,
      };
    });

    return map;
  }, [results, parties]);

  return { colorMap };
}
