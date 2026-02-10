// Firestore data operations
// Handles all database reads/writes

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { COLLECTIONS } from './constants';
import { calculateAllianceVotes, getWinnerAllianceId } from './alliances';
import type {
  Party,
  Constituency,
  Candidate,
  Result,
  ElectionSummary,
  SeatCount,
} from '@/types';

// ============================================
// Parties
// ============================================

export async function getParties(): Promise<Party[]> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTIONS.PARTIES), orderBy('order'))
  );
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party));
}

export function subscribeToParties(callback: (parties: Party[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(firestore, COLLECTIONS.PARTIES), orderBy('order')),
    snapshot => {
      const parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party));
      callback(parties);
    }
  );
}

// ============================================
// Constituencies
// ============================================

export async function getConstituencies(): Promise<Constituency[]> {
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CONSTITUENCIES));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Constituency));
}

export async function getConstituencyById(id: string): Promise<Constituency | null> {
  const docRef = doc(firestore, COLLECTIONS.CONSTITUENCIES, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Constituency) : null;
}

// Get raw constituency document (all fields including party arrays)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getConstituencyDocument(id: string): Promise<Record<string, any> | null> {
  const docRef = doc(firestore, COLLECTIONS.CONSTITUENCIES, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// Fetch ALL constituency documents (id + full data) for the admin panel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAllConstituencyDocuments(): Promise<{ id: string; data: Record<string, any> }[]> {
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CONSTITUENCIES));
  return snapshot.docs.map(d => ({ id: d.id, data: d.data() }));
}

export async function getConstituenciesByDistrict(districtId: string): Promise<Constituency[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTIONS.CONSTITUENCIES),
      where('districtId', '==', districtId),
      orderBy('number')
    )
  );
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Constituency));
}

// ============================================
// Candidates
// ============================================

export async function getCandidates(): Promise<Candidate[]> {
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.CANDIDATES));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
}

export async function getCandidatesByConstituency(constituencyId: string): Promise<Candidate[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTIONS.CANDIDATES),
      where('constituencyId', '==', constituencyId)
    )
  );
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
}

// ============================================
// Results
// ============================================

export async function getResults(): Promise<Result[]> {
  const snapshot = await getDocs(collection(firestore, COLLECTIONS.RESULTS));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Result;
  });
}

export async function getResultByConstituency(constituencyId: string): Promise<Result | null> {
  const docRef = doc(firestore, COLLECTIONS.RESULTS, constituencyId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Result;
}

export function subscribeToResults(callback: (results: Result[]) => void): Unsubscribe {
  return onSnapshot(collection(firestore, COLLECTIONS.RESULTS), snapshot => {
    const results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Result;
    });
    callback(results);
  });
}

export function subscribeToResult(
  constituencyId: string,
  callback: (result: Result | null) => void
): Unsubscribe {
  return onSnapshot(doc(firestore, COLLECTIONS.RESULTS, constituencyId), docSnap => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    const data = docSnap.data();
    callback({
      id: docSnap.id,
      ...data,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Result);
  });
}

// ============================================
// Save Result (Admin)
// ============================================

export interface SaveResultPayload {
  constituencyId: string;
  partyVotes: Record<string, number>;
  status: 'partial' | 'completed';
  adminUid: string;
}

export async function saveResult(payload: SaveResultPayload): Promise<void> {
  const { constituencyId, partyVotes, status, adminUid } = payload;
  
  // Calculate totals and winner
  const totalVotes = Object.values(partyVotes).reduce((sum, v) => sum + v, 0);
  
  // Find winner (party with most votes)
  const sortedParties = Object.entries(partyVotes).sort(([, a], [, b]) => b - a);
  const winnerId = sortedParties[0]?.[0] || null;
  const winnerVotes = sortedParties[0]?.[1] || 0;
  const runnerUpVotes = sortedParties[1]?.[1] || 0;
  const margin = winnerVotes - runnerUpVotes;
  const marginPercentage = totalVotes > 0 ? (margin / totalVotes) * 100 : 0;
  
  // Calculate alliance aggregation
  const allianceVotes = calculateAllianceVotes(partyVotes);
  const winnerAllianceId = status === 'completed' ? getWinnerAllianceId(winnerId) : null;
  
  // Get constituency for turnout calculation
  const constituency = await getConstituencyById(constituencyId);
  const totalVoters = constituency?.totalVoters || 0;
  const turnoutPercentage = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;
  
  const resultDoc = {
    constituencyId,
    partyVotes,
    allianceVotes,
    winnerPartyId: status === 'completed' ? winnerId : null,
    winnerAllianceId,
    winnerCandidateId: null, // TODO: Link to candidate
    totalVotes,
    turnoutPercentage,
    margin,
    marginPercentage,
    status,
    updatedAt: serverTimestamp(),
    updatedBy: adminUid,
  };
  
  await setDoc(doc(firestore, COLLECTIONS.RESULTS, constituencyId), resultDoc);
  
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
  let totalTurnout = 0;
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
    totalTurnout += result.turnoutPercentage;
    
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
    } else if (result.status === 'partial') {
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
  
  const summary: Omit<ElectionSummary, 'lastUpdated'> & { lastUpdated: ReturnType<typeof serverTimestamp> } = {
    totalSeats: 300,
    declaredSeats,
    requiredMajority: 151,
    partySeatCounts: Object.values(seatCounts)
      .filter(sc => sc.seats > 0 || sc.leadingSeats > 0 || sc.totalVotes > 0)
      .sort((a, b) => b.seats - a.seats || b.totalVotes - a.totalVotes),
    totalVotesCast,
    averageTurnout: results.length > 0 ? totalTurnout / results.length : 0,
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
