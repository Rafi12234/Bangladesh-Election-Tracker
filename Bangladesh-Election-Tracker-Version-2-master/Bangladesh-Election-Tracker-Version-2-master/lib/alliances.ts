/**
 * Alliance Helper Functions
 * Handles alliance vote aggregation and seat counting
 */

import type { PartyVotes, AllianceVotes, AllianceSeatCount, SeatCount, Result } from '@/types';
import { alliances, getPartyById } from '@/data/parties';

/**
 * Calculate alliance votes from party votes
 * @param partyVotes - Votes for each party
 * @returns Aggregated votes by alliance
 */
export function calculateAllianceVotes(partyVotes: PartyVotes): AllianceVotes {
  const allianceVotes: AllianceVotes = {
    bnp: 0,
    jamaat: 0,
    others: 0,
  };

  Object.entries(partyVotes).forEach(([partyId, votes]) => {
    const party = getPartyById(partyId);
    
    if (!party) {
      // Unknown party -> goes to others
      allianceVotes.others += votes;
      return;
    }

    if (party.allianceId === 'bnp') {
      allianceVotes.bnp += votes;
    } else if (party.allianceId === 'jamaat') {
      allianceVotes.jamaat += votes;
    } else {
      // No alliance or independent -> goes to others
      allianceVotes.others += votes;
    }
  });

  return allianceVotes;
}

/**
 * Determine winner alliance from party winner
 * @param winnerPartyId - ID of winning party
 * @returns Alliance ID ('bnp', 'jamaat', 'others') or null
 */
export function getWinnerAllianceId(winnerPartyId: string | null): string | null {
  if (!winnerPartyId) return null;
  
  const party = getPartyById(winnerPartyId);
  if (!party) return 'others';
  
  if (party.allianceId === 'bnp') return 'bnp';
  if (party.allianceId === 'jamaat') return 'jamaat';
  return 'others';
}

/**
 * Aggregate seat counts by alliance
 * @param results - Array of constituency results
 * @returns Alliance-level seat counts with party breakdowns
 */
export function aggregateAllianceSeatCounts(results: Result[]): AllianceSeatCount[] {
  // Initialize alliance seat counts
  const allianceData: Record<string, {
    seats: Record<string, number>;
    leadingSeats: Record<string, number>;
    votes: Record<string, number>;
  }> = {
    bnp: { seats: {}, leadingSeats: {}, votes: {} },
    jamaat: { seats: {}, leadingSeats: {}, votes: {} },
    others: { seats: {}, leadingSeats: {}, votes: {} },
  };

  // Count seats and votes by alliance and party
  results.forEach(result => {
    const allianceId = result.winnerAllianceId || 'others';
    const partyId = result.winnerPartyId;
    
    if (!partyId) return;

    // Count seats
    if (result.status === 'completed') {
      allianceData[allianceId].seats[partyId] = (allianceData[allianceId].seats[partyId] || 0) + 1;
    } else if (result.status === 'partial' || result.status === 'counting') {
      allianceData[allianceId].leadingSeats[partyId] = (allianceData[allianceId].leadingSeats[partyId] || 0) + 1;
    }

    // Aggregate votes
    Object.entries(result.partyVotes).forEach(([pId, votes]) => {
      const party = getPartyById(pId);
      if (!party) return;

      const pAllianceId = party.allianceId === 'bnp' ? 'bnp' 
        : party.allianceId === 'jamaat' ? 'jamaat' 
        : 'others';

      allianceData[pAllianceId].votes[pId] = (allianceData[pAllianceId].votes[pId] || 0) + votes;
    });
  });

  // Calculate totals
  const totalVotesCast = results.reduce((sum, r) => sum + r.totalVotes, 0);

  // Build alliance seat counts
  return Object.entries(alliances).map(([allianceId, allianceInfo]) => {
    const data = allianceData[allianceId as keyof typeof allianceData];
    
    // Calculate party-level breakdowns
    const partyBreakdowns: SeatCount[] = [];
    const allPartyIds = new Set([
      ...Object.keys(data.seats),
      ...Object.keys(data.leadingSeats),
      ...Object.keys(data.votes),
    ]);

    allPartyIds.forEach(partyId => {
      const party = getPartyById(partyId);
      if (!party) return;

      partyBreakdowns.push({
        partyId: party.id,
        partyName: party.shortName,
        partyColor: party.color,
        seats: data.seats[partyId] || 0,
        leadingSeats: data.leadingSeats[partyId] || 0,
        totalVotes: data.votes[partyId] || 0,
        votePercentage: totalVotesCast > 0 ? ((data.votes[partyId] || 0) / totalVotesCast) * 100 : 0,
        allianceId: party.allianceId,
      });
    });

    // Sort parties by seats
    partyBreakdowns.sort((a, b) => b.seats - a.seats);

    // Calculate alliance totals
    const totalSeats = Object.values(data.seats).reduce((sum, s) => sum + s, 0);
    const totalLeading = Object.values(data.leadingSeats).reduce((sum, s) => sum + s, 0);
    const totalVotes = Object.values(data.votes).reduce((sum, v) => sum + v, 0);

    return {
      allianceId,
      allianceName: allianceInfo.name,
      allianceColor: allianceInfo.color,
      seats: totalSeats,
      leadingSeats: totalLeading,
      totalVotes,
      votePercentage: totalVotesCast > 0 ? (totalVotes / totalVotesCast) * 100 : 0,
      parties: partyBreakdowns,
    };
  });
}

/**
 * Get alliance info by ID
 * @param allianceId - Alliance identifier
 * @returns Alliance information
 */
export function getAllianceInfo(allianceId: string | null) {
  if (allianceId === 'bnp') return alliances.bnp;
  if (allianceId === 'jamaat') return alliances.jamaat;
  return alliances.others;
}

/**
 * Get display name for constituency winner (includes alliance info if applicable)
 * @param winnerPartyId - Winning party ID
 * @param includeAlliance - Whether to include alliance name
 * @returns Formatted display name
 */
export function getWinnerDisplayName(winnerPartyId: string | null, includeAlliance: boolean = false): string {
  if (!winnerPartyId) return 'No result';
  
  const party = getPartyById(winnerPartyId);
  if (!party) return 'Unknown';

  if (!includeAlliance || !party.allianceId) {
    return party.isIndependent ? `Independent` : party.shortName;
  }

  const alliance = getAllianceInfo(party.allianceId);
  return `${party.shortName} (${alliance.shortName})`;
}
