import Image from 'next/image';
import { formatNumber } from '@/lib/utils';

interface PartyResults {
  partyName: string;
  shortName: string;
  leaderName: string;
  seatCount: number;
  partyColor: string;
  logoUrl: string;
  popularVotePct?: number;
  popularVotes?: number;
}

interface ElectionResultsBarProps {
  left: PartyResults;
  right: PartyResults;
  totalSeats: number;
  seatsToWin: number;
}

export default function ElectionResultsBar({ 
  left, 
  right, 
  totalSeats, 
  seatsToWin 
}: ElectionResultsBarProps) {
  const leftPercentage = (left.seatCount / totalSeats) * 100;
  const rightPercentage = (right.seatCount / totalSeats) * 100;
  const winLinePosition = (seatsToWin / totalSeats) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center">
          Election Results Comparison
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
          {seatsToWin} seats needed to win • {totalSeats} total seats
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8">
        {/* Desktop Layout: Side by Side */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-8 mb-8">
          {/* Left Party (BNP) */}
          <PartyColumn party={left} alignment="left" />
          
          {/* Right Party (Jamaat) */}
          <PartyColumn party={right} alignment="right" />
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="sm:hidden space-y-6 mb-8">
          <PartyColumn party={left} alignment="center" />
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <PartyColumn party={right} alignment="center" />
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-4">
          {/* Seats to Win Marker */}
          <div className="relative">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>0</span>
              <span 
                className="absolute transform -translate-x-1/2 font-semibold text-gray-700 dark:text-gray-300"
                style={{ left: `${winLinePosition}%` }}
              >
                {seatsToWin} to win
              </span>
              <span>{totalSeats}</span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner">
              {/* Left Party Bar */}
              <div
                className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${leftPercentage}%`,
                  backgroundColor: left.partyColor,
                }}
              />
              
              {/* Right Party Bar */}
              <div
                className="absolute right-0 top-0 h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${rightPercentage}%`,
                  backgroundColor: right.partyColor,
                }}
              />
              
              {/* Seats to Win Line */}
              <div
                className="absolute top-0 w-0.5 h-full bg-gray-800 dark:bg-gray-200 z-10 shadow-lg"
                style={{ left: `${winLinePosition}%` }}
              />
              
              {/* Seat Count Labels on Bar */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                {left.seatCount > 0 && (
                  <span className="text-white font-bold text-sm drop-shadow-md">
                    {left.seatCount}
                  </span>
                )}
                {right.seatCount > 0 && (
                  <span className="text-white font-bold text-sm drop-shadow-md">
                    {right.seatCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Popular Vote Section */}
          {(left.popularVotePct !== undefined || right.popularVotePct !== undefined) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <PopularVoteDisplay party={left} alignment="left" />
              <PopularVoteDisplay party={right} alignment="right" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PartyColumn({ 
  party, 
  alignment
}: { 
  party: PartyResults; 
  alignment: 'left' | 'right' | 'center';
}) {
  const textAlign = alignment === 'center' ? 'text-center' : 
                   alignment === 'left' ? 'text-left sm:text-left' : 'text-left sm:text-right';
  
  const flexAlign = alignment === 'center' ? 'items-center' : 
                    alignment === 'left' ? 'sm:items-start' : 'sm:items-end';

  return (
    <div className={`flex flex-col ${flexAlign} space-y-4`}>
      {/* Party Logo */}
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-white dark:ring-gray-800">
          <Image
            src={party.logoUrl}
            alt={`${party.shortName} Logo`}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        
        {/* Seat Count Badge */}
        <div 
          className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg"
          style={{ backgroundColor: party.partyColor }}
        >
          {party.seatCount}
        </div>
      </div>

      {/* Party Info */}
      <div className={textAlign}>
        {/* Large Seat Number */}
        <div 
          className="text-4xl sm:text-5xl font-black mb-2 transition-all duration-500"
          style={{ color: party.partyColor }}
        >
          {party.seatCount}
        </div>
        
        {/* Party Name */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
          {party.shortName}
        </h3>
        
        {/* Leader Name */}
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {party.leaderName}
        </p>
        
        {/* Full Party Name */}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 max-w-32 sm:max-w-none">
          {party.partyName}
        </p>
      </div>
    </div>
  );
}

function PopularVoteDisplay({ 
  party, 
  alignment 
}: { 
  party: PartyResults; 
  alignment: 'left' | 'right';
}) {
  const textAlign = alignment === 'left' ? 'text-left' : 'text-right';
  
  return (
    <div className={`space-y-1 ${textAlign}`}>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Popular Vote
      </div>
      {party.popularVotePct !== undefined && (
        <div 
          className="text-lg font-bold"
          style={{ color: party.partyColor }}
        >
          {party.popularVotePct.toFixed(1)}%
        </div>
      )}
      {party.popularVotes !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatNumber(party.popularVotes)} votes
        </div>
      )}
    </div>
  );
}

// Export types for use in other components
export type { ElectionResultsBarProps, PartyResults };