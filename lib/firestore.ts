// Firestore data operations
// Handles all database reads/writes

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { COLLECTIONS, ELECTION_CONFIG } from './constants';
import { calculateAllianceVotes, getWinnerAllianceId } from './alliances';
import { divisions } from '@/data/divisions';
import { normalizePartyKey } from '@/data/parties';
import type {
  Party,
  Constituency,
  Candidate,
  Result,
  ElectionSummary,
  SeatCount,
} from '@/types';

// ============================================
// Simple in-memory cache for better performance
// ============================================
const cache = {
  parties: null as Party[] | null,
  constituencies: null as Constituency[] | null,
  partiesTimestamp: 0,
  constituenciesTimestamp: 0,
};

const CACHE_DURATION = 300000; // 5 minutes cache (increased from 1 minute)

// ============================================
// District lookup (same pattern as AdminPanel)
// ============================================

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

/**
 * Normalize a constituency ID to ensure URL-safe format
 * Converts "cox's bazar-1" or "Cox's Bazar-1" to "coxs-bazar-1"
 */
export function normalizeConstituencyId(id: string): string {
  return id
    .toLowerCase()
    .replace(/['`]/g, '') // Remove apostrophes
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .trim();
}

function parseConstituencyId(docId: string): { districtId: string; number: number } {
  const normalized = normalizeConstituencyId(docId);
  const lastDash = normalized.lastIndexOf('-');
  if (lastDash === -1) return { districtId: normalized, number: 0 };
  const numPart = normalized.slice(lastDash + 1);
  const num = parseInt(numPart, 10);
  if (isNaN(num)) return { districtId: normalized, number: 0 };
  return { districtId: normalized.slice(0, lastDash), number: num };
}

function buildConstituency(docId: string): Constituency {
  const { districtId, number } = parseConstituencyId(docId);
  const info = DISTRICT_MAP.get(districtId);
  const displayName = info ? `${info.districtName}-${number}` : docId;

  return {
    id: docId,
    name: displayName,
    number,
    districtId,
    divisionId: info?.divisionId || '',
    totalVoters: 0,
  };
}

/**
 * Normalize a Result read from Firestore so that partyVotes keys and
 * winnerPartyId use party IDs (e.g. 'bnp') instead of full party names.
 */
function normalizeResult(raw: Record<string, unknown>, docId: string): Result {
  const rawPartyVotes = (raw.partyVotes || {}) as Record<string, number>;

  // Normalise partyVotes keys
  const partyVotes: Record<string, number> = {};
  for (const [key, votes] of Object.entries(rawPartyVotes)) {
    const normalizedKey = normalizePartyKey(key);
    partyVotes[normalizedKey] = (partyVotes[normalizedKey] || 0) + votes;
  }

  // Get stored winner or compute from votes if missing
  let winnerPartyId = raw.winnerPartyId
    ? normalizePartyKey(raw.winnerPartyId as string)
    : null;
  
  // If winnerPartyId is missing but we have votes, compute current leader
  if (!winnerPartyId && Object.keys(partyVotes).length > 0) {
    const sortedParties = Object.entries(partyVotes).sort(([, a], [, b]) => b - a);
    winnerPartyId = sortedParties[0]?.[0] || null;
  }

  const status = (raw.status as Result['status']) || 'pending';

  // ALWAYS recompute winnerAllianceId from the normalized winnerPartyId
  // Ignore stored value to fix legacy data issues
  const winnerAllianceId = winnerPartyId && status === 'completed'
    ? getWinnerAllianceId(winnerPartyId)
    : null;

  // Compute or use stored totals and margin
  const totalVotes = (raw.totalVotes as number) || Object.values(partyVotes).reduce((sum, v) => sum + v, 0);
  
  let margin = (raw.margin as number) || 0;
  let marginPercentage = (raw.marginPercentage as number) || 0;
  
  // Recompute margin if missing or if we just computed the winner
  if ((!margin || !raw.winnerPartyId) && Object.keys(partyVotes).length > 1) {
    const sortedVotes = Object.values(partyVotes).sort((a, b) => b - a);
    margin = (sortedVotes[0] || 0) - (sortedVotes[1] || 0);
    marginPercentage = totalVotes > 0 ? (margin / totalVotes) * 100 : 0;
  }

  return {
    id: docId,
    constituencyId: (raw.constituencyId as string) || docId,
    partyVotes,
    allianceVotes: calculateAllianceVotes(partyVotes), // Recompute from normalized votes
    winnerPartyId,
    winnerAllianceId,
    winnerCandidateId: (raw.winnerCandidateId as string) || null,
    totalVotes,
    margin,
    marginPercentage,
    status,
    updatedAt: (raw.updatedAt as Timestamp)?.toDate?.() || new Date(),
    updatedBy: (raw.updatedBy as string) || '',
  };
}

// ============================================
// Parties
// ============================================

export async function getParties(): Promise<Party[]> {
  // Return cached data if still fresh
  const now = Date.now();
  if (cache.parties && now - cache.partiesTimestamp < CACHE_DURATION) {
    return cache.parties;
  }

  const snapshot = await getDocs(
    query(collection(firestore, COLLECTIONS.PARTIES), orderBy('order'))
  );
  const parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party));
  
  // Update cache
  cache.parties = parties;
  cache.partiesTimestamp = now;
  
  return parties;
}

export function subscribeToParties(callback: (parties: Party[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(firestore, COLLECTIONS.PARTIES), orderBy('order')),
    snapshot => {
      const parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party));
      // Update cache on real-time updates
      cache.parties = parties;
      cache.partiesTimestamp = Date.now();
      callback(parties);
    }
  );
}

// ============================================
// Constituencies
// ============================================

export async function getConstituencies(): Promise<Constituency[]> {
  // Return cached data if still fresh
  const now = Date.now();
  if (cache.constituencies && now - cache.constituenciesTimestamp < CACHE_DURATION) {
    return cache.constituencies;
  }

  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CONSTITUENCIES));
  const constituencies = snapshot.docs
    .map(d => buildConstituency(d.id))
    .sort((a, b) => a.name.localeCompare(b.name) || a.number - b.number);
  
  // Update cache
  cache.constituencies = constituencies;
  cache.constituenciesTimestamp = now;
  
  return constituencies;
}

export async function getConstituencyById(id: string): Promise<Constituency | null> {
  const normalizedId = normalizeConstituencyId(id);
  
  // Build constituency from divisions data structure
  // Firebase documents are only for candidates, not constituency existence
  const { districtId } = parseConstituencyId(normalizedId);
  const info = DISTRICT_MAP.get(districtId);
  
  // Only return null if the district doesn't exist in our data
  if (!info) return null;
  
  return buildConstituency(normalizedId);
}

// Get raw constituency document (all fields including party arrays)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getConstituencyDocument(id: string): Promise<Record<string, any> | null> {
  const normalizedId = normalizeConstituencyId(id);
  
  // Try normalized ID first, then original format for backward compatibility
  let docRef = doc(firestore, COLLECTIONS.CONSTITUENCIES, normalizedId);
  let docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Try with original format (with apostrophes and spaces)
    const originalFormat = decodeURIComponent(id).toLowerCase();
    docRef = doc(firestore, COLLECTIONS.CONSTITUENCIES, originalFormat);
    docSnap = await getDoc(docRef);
  }
  
  return docSnap.exists() ? docSnap.data() : null;
}

// Fetch ALL constituency documents (id + full data) for the admin panel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAllConstituencyDocuments(): Promise<{ id: string; data: Record<string, any> }[]> {
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CONSTITUENCIES));
  return snapshot.docs.map(d => ({ id: d.id, data: d.data() }));
}

export async function getConstituenciesByDistrict(districtId: string): Promise<Constituency[]> {
  // Since constituency docs don't have a 'districtId' field, we fetch all and filter by ID prefix
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CONSTITUENCIES));
  return snapshot.docs
    .filter(d => {
      const parsed = parseConstituencyId(d.id);
      return parsed.districtId === districtId;
    })
    .map(d => buildConstituency(d.id))
    .sort((a, b) => a.number - b.number);
}

// ============================================
// Candidates
// ============================================

export async function getCandidates(): Promise<Candidate[]> {
  // Candidates are embedded inside constituency docs, not in a separate collection.
  // Fetch all constituency docs and flatten their candidates arrays.
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CONSTITUENCIES));
  const all: Candidate[] = [];
  snapshot.docs.forEach(d => {
    const data = d.data();
    const arr = data.candidates;
    if (Array.isArray(arr)) {
      arr.forEach((item: Record<string, string>, idx: number) => {
        all.push({
          id: `${d.id}-${idx}`,
          name: item.candidateName || item.name || '',
          partyId: normalizePartyKey(item.party || ''),
          constituencyId: d.id,
          symbol: item.symbol || '',
        });
      });
    }
  });
  return all;
}

export async function getCandidatesByConstituency(constituencyId: string): Promise<Candidate[]> {
  // Read candidates from the constituency document's embedded array
  const normalizedId = normalizeConstituencyId(constituencyId);
  
  // Try normalized ID first, then original format for backward compatibility
  let docRef = doc(firestore, COLLECTIONS.CONSTITUENCIES, normalizedId);
  let docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Try with original format (with apostrophes and spaces)
    const originalFormat = decodeURIComponent(constituencyId).toLowerCase();
    docRef = doc(firestore, COLLECTIONS.CONSTITUENCIES, originalFormat);
    docSnap = await getDoc(docRef);
  }
  
  if (!docSnap.exists()) return [];

  const data = docSnap.data();
  const arr = data.candidates;
  if (!Array.isArray(arr)) return [];

  return arr.map((item: Record<string, string>, idx: number) => ({
    id: `${normalizedId}-${idx}`,
    name: item.candidateName || item.name || '',
    partyId: normalizePartyKey(item.party || ''),
    constituencyId: normalizedId,
    symbol: item.symbol || '',
  }));
}

// ============================================
// Results
// ============================================

export async function getResults(): Promise<Result[]> {
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.RESULTS));
  return snapshot.docs.map(d => normalizeResult(d.data(), d.id));
}

export async function getResultByConstituency(constituencyId: string): Promise<Result | null> {
  const normalizedId = normalizeConstituencyId(constituencyId);
  
  // Try normalized ID first, then original format for backward compatibility
  let docRef = doc(firestore, COLLECTIONS.RESULTS, normalizedId);
  let docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Try with original format (with apostrophes and spaces)
    const originalFormat = decodeURIComponent(constituencyId).toLowerCase();
    docRef = doc(firestore, COLLECTIONS.RESULTS, originalFormat);
    docSnap = await getDoc(docRef);
  }
  
  if (!docSnap.exists()) return null;
  return normalizeResult(docSnap.data(), docSnap.id);
}

export function subscribeToResults(callback: (results: Result[]) => void): Unsubscribe {
  return onSnapshot(collection(firestore, COLLECTIONS.RESULTS), snapshot => {
    const results = snapshot.docs.map(d => normalizeResult(d.data(), d.id));
    callback(results);
  });
}

export function subscribeToResult(
  constituencyId: string,
  callback: (result: Result | null) => void
): Unsubscribe {
  const normalizedId = normalizeConstituencyId(constituencyId);
  
  // First try normalized format
  let unsubscribe = onSnapshot(doc(firestore, COLLECTIONS.RESULTS, normalizedId), docSnap => {
    if (docSnap.exists()) {
      callback(normalizeResult(docSnap.data(), docSnap.id));
      return;
    }
    
    // If document doesn't exist with normalized ID, try original format
    const originalFormat = decodeURIComponent(constituencyId).toLowerCase();
    const fallbackUnsubscribe = onSnapshot(doc(firestore, COLLECTIONS.RESULTS, originalFormat), fallbackDocSnap => {
      if (!fallbackDocSnap.exists()) {
        callback(null);
        return;
      }
      callback(normalizeResult(fallbackDocSnap.data(), fallbackDocSnap.id));
    });
    
    // Clean up the original listener and use the fallback
    unsubscribe();
    unsubscribe = fallbackUnsubscribe;
  });
  
  return () => unsubscribe();
}

// ============================================
// Save Result (Admin)
// ============================================

export interface SaveResultPayload {
  constituencyId: string;
  winnerPartyId: string;
  partyVotes?: Record<string, number>;
  status: 'pending' | 'partial' | 'counting' | 'completed';
  adminUid: string;
}

export async function saveResult(payload: SaveResultPayload): Promise<void> {
  const { status, adminUid, winnerPartyId } = payload;
  const normalizedId = normalizeConstituencyId(payload.constituencyId);
  
  // Check which document ID format already exists to avoid duplicates
  let actualDocId = normalizedId;  // Default to normalized
  const originalFormat = decodeURIComponent(payload.constituencyId).toLowerCase();
  
  // Check if document exists with original format first
  if (originalFormat !== normalizedId) {
    const originalDocRef = doc(firestore, COLLECTIONS.RESULTS, originalFormat);
    const originalDocSnap = await getDoc(originalDocRef);
    if (originalDocSnap.exists()) {
      actualDocId = originalFormat;  // Use original format if it exists
    }
  }
  
  // If partyVotes provided, normalize keys; otherwise use empty
  const partyVotes: Record<string, number> = {};
  if (payload.partyVotes) {
    for (const [key, votes] of Object.entries(payload.partyVotes)) {
      const normalizedKey = normalizePartyKey(key);
      partyVotes[normalizedKey] = (partyVotes[normalizedKey] || 0) + votes;
    }
  }
  
  const totalVotes = Object.values(partyVotes).reduce((sum, v) => sum + v, 0);
  
  // Use the explicitly declared winner
  const winnerId = winnerPartyId || null;
  const winnerAllianceId = status === 'completed' ? getWinnerAllianceId(winnerId) : null;
  
  // Calculate alliance aggregation if votes exist
  const allianceVotes = calculateAllianceVotes(partyVotes);
  
  const resultDoc = {
    constituencyId: actualDocId,
    partyVotes,
    allianceVotes,
    winnerPartyId: winnerId,
    winnerAllianceId,
    winnerCandidateId: null,
    totalVotes,
    margin: 0,
    marginPercentage: 0,
    status,
    updatedAt: serverTimestamp(),
    updatedBy: adminUid,
  };
  
  await setDoc(doc(firestore, COLLECTIONS.RESULTS, actualDocId), resultDoc);
  
  // Update summary document
  await updateElectionSummary();
}

// ============================================
// Election Summary
// ============================================

export async function getElectionSummary(): Promise<ElectionSummary | null> {
  const docRef = doc(firestore, COLLECTIONS.SUMMARY, 'current');
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    ...data,
    lastUpdated: data.lastUpdated?.toDate() || new Date(),
  } as ElectionSummary;
}

export function subscribeToSummary(
  callback: (summary: ElectionSummary | null) => void
): Unsubscribe {
  return onSnapshot(doc(firestore, COLLECTIONS.SUMMARY, 'current'), docSnap => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    const data = docSnap.data();
    callback({
      ...data,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    } as ElectionSummary);
  });
}

// Recalculate and update summary
async function updateElectionSummary(): Promise<void> {
  const [results, parties] = await Promise.all([getResults(), getParties()]);
  
  const seatCounts: Record<string, SeatCount> = {};
  let totalVotesCast = 0;
  let declaredSeats = 0;
  
  // Initialize seat counts for all parties
  parties.forEach(party => {
    seatCounts[party.id] = {
      partyId: party.id,
      partyName: party.name,
      partyColor: party.color,
      seats: 0,
      leadingSeats: 0,
      totalVotes: 0,
      votePercentage: 0,
    };
  });
  
  // Process results
  results.forEach(result => {
    totalVotesCast += result.totalVotes;
    
    // Add votes per party
    Object.entries(result.partyVotes).forEach(([partyId, votes]) => {
      if (seatCounts[partyId]) {
        seatCounts[partyId].totalVotes += votes;
      }
    });
    
    // Count seats
    if (result.status === 'completed' && result.winnerPartyId) {
      declaredSeats++;
      if (seatCounts[result.winnerPartyId]) {
        seatCounts[result.winnerPartyId].seats++;
      }
    } else if (result.status === 'partial' || result.status === 'counting') {
      // Find current leader
      const leader = Object.entries(result.partyVotes).sort(([, a], [, b]) => b - a)[0];
      if (leader && seatCounts[leader[0]]) {
        seatCounts[leader[0]].leadingSeats++;
      }
    }
  });
  
  // Calculate vote percentages
  Object.values(seatCounts).forEach(sc => {
    sc.votePercentage = totalVotesCast > 0 ? (sc.totalVotes / totalVotesCast) * 100 : 0;
  });

  const totalRegisteredVoters = ELECTION_CONFIG.TOTAL_REGISTERED_VOTERS;
  const nationalTurnout = totalRegisteredVoters > 0 ? (totalVotesCast / totalRegisteredVoters) * 100 : 0;
  
  const summary: Omit<ElectionSummary, 'lastUpdated'> & { lastUpdated: ReturnType<typeof serverTimestamp> } = {
    totalSeats: 300,
    declaredSeats,
    requiredMajority: 151,
    partySeatCounts: Object.values(seatCounts)
      .filter(sc => sc.seats > 0 || sc.leadingSeats > 0 || sc.totalVotes > 0)
      .sort((a, b) => b.seats - a.seats || b.totalVotes - a.totalVotes),
    totalVotesCast,
    totalRegisteredVoters,
    nationalTurnout,
    lastUpdated: serverTimestamp(),
  };
  
  await setDoc(doc(firestore, COLLECTIONS.SUMMARY, 'current'), summary);
}

// ============================================
// Seed Data (for initial setup)
// ============================================

export async function seedInitialData(parties: Party[], constituencies: Constituency[]): Promise<void> {
  const batch = writeBatch(firestore);
  
  // Seed parties
  parties.forEach(party => {
    const ref = doc(firestore, COLLECTIONS.PARTIES, party.id);
    batch.set(ref, party);
  });
  
  // Seed constituencies
  constituencies.forEach(constituency => {
    const ref = doc(firestore, COLLECTIONS.CONSTITUENCIES, constituency.id);
    batch.set(ref, constituency);
  });
  
  await batch.commit();
}
