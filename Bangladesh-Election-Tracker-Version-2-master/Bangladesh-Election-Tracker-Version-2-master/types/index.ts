// Type definitions for Bangladesh Election Tracker

import { Timestamp } from 'firebase/firestore';

// ============================================
// Firestore Document Types
// ============================================

export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  symbol: string; // URL or emoji
  order: number;  // Display order
  allianceId: string | null; // 'bnp', 'jamaat', or null for Others
  isIndependent: boolean; // true for independent candidates
}

// ============================================
// News Article Types
// ============================================

export interface NewsArticle {
  id?: string; // Firestore document ID
  headline: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  sourceName?: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authorId: string;
}

export interface NewsArticleForm {
  headline: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  sourceName?: string;
  tags?: string[];
  status: 'draft' | 'published';
}

export interface Division {
  id: string;
  name: string;
  bnName: string; // Bengali name
}

export interface District {
  id: string;
  name: string;
  bnName: string;
  divisionId: string;
}

export interface Constituency {
  id: string;
  name: string;
  number: number; // e.g., 1 for Dhaka-1
  districtId: string;
  divisionId: string;
  totalVoters: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Candidate {
  id: string;
  name: string;
  partyId: string;
  constituencyId: string;
  symbol?: string;
  photo?: string;
}

export interface PartyVotes {
  [partyId: string]: number;
}

export interface AllianceVotes {
  bnp: number;      // BNP Alliance (2026) total
  jamaat: number;   // Jamaat-e-Islami NCP Alliance (2026) total
  others: number;   // Others + independents total
}

export interface Result {
  id: string;
  constituencyId: string;
  partyVotes: PartyVotes;
  allianceVotes: AllianceVotes; // Auto-calculated alliance aggregation
  winnerPartyId: string | null;
  winnerAllianceId: string | null; // 'bnp', 'jamaat', or 'others'
  winnerCandidateId: string | null;
  totalVotes: number;
  margin: number;
  marginPercentage: number;
  status: 'pending' | 'partial' | 'completed' | 'counting';
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// Aggregated/Computed Types
// ============================================

export interface SeatCount {
  partyId: string;
  partyName: string;
  partyColor: string;
  seats: number;
  leadingSeats: number; // Where leading but not declared
  totalVotes: number;
  votePercentage: number;
  allianceId?: string | null; // For party-level seat counts
}

export interface AllianceSeatCount {
  allianceId: string;
  allianceName: string;
  allianceColor: string;
  seats: number;
  leadingSeats: number;
  totalVotes: number;
  votePercentage: number;
  parties: SeatCount[]; // Member parties breakdown
}

export interface ElectionSummary {
  totalSeats: number;
  declaredSeats: number;
  requiredMajority: number;
  partySeatCounts: SeatCount[];
  totalVotesCast: number;
  totalRegisteredVoters: number;
  nationalTurnout: number; // totalVotesCast / totalRegisteredVoters * 100
  lastUpdated: Date;
}

export interface ConstituencyResult extends Constituency {
  result: Result | null;
  candidates: Candidate[];
  partyVotesDetails: {
    partyId: string;
    partyName: string;
    partyColor: string;
    candidateName: string;
    votes: number;
    percentage: number;
  }[];
}

// ============================================
// Map Types
// ============================================

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    constituencyNumber?: number;
    district?: string;
    division?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// ============================================
// Admin Types
// ============================================

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'data-entry';
  assignedDivisions?: string[]; // Optional: limit to specific divisions
  createdAt: Date;
}

export interface VoteEntry {
  partyId: string;
  candidateId: string;
  votes: number;
}

export interface SubmitResultPayload {
  constituencyId: string;
  entries: VoteEntry[];
  status: 'completed';
}

// ============================================
// UI State Types
// ============================================

export interface FilterState {
  division: string | null;
  district: string | null;
  status: 'all' | 'pending' | 'partial' | 'counting' | 'completed';
}

export interface MapTooltipData {
  constituencyName: string;
  constituencyNumber: number;
  winnerParty: string | null;
  winnerCandidate: string | null;
  votes: number;
  margin: number;
  turnout: number;
  status: string;
}
