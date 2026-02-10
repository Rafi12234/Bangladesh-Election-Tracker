'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import type { AllianceSeatCount } from '@/types';

interface Props {
  allianceSeatCounts: AllianceSeatCount[];
  totalSeats: number;
}

const UNDECLARED_COLOR = '#9CA3AF'; // gray-400 - better visibility in both light and dark modes

export default function ParliamentSeats({ allianceSeatCounts, totalSeats }: Props) {
  // Calculate angles for each alliance segment + undeclared
  const segments = useMemo(() => {
    const TOTAL_PARLIAMENT_SEATS = 300;
    const declaredSeats = totalSeats;
    const undeclaredSeats = TOTAL_PARLIAMENT_SEATS - declaredSeats;
    
    // Filter out alliances with 0 seats
    const alliancesWithSeats = allianceSeatCounts.filter(a => a.seats > 0);
    
    // Add undeclared segment if there are undeclared seats
    const allSegments = [...alliancesWithSeats];
    if (undeclaredSeats > 0) {
      allSegments.push({
        allianceId: 'undeclared',
        allianceName: 'Undeclared',
        allianceColor: UNDECLARED_COLOR,
        seats: undeclaredSeats,
        leadingSeats: 0,
        totalVotes: 0,
        votePercentage: 0,
        parties: [],
      });
    }
    
    if (allSegments.length === 0) return [];
    
    let startAngle = -180; // Start from left (180 degrees in standard position)
    
    return allSegments.map(alliance => {
      const percentage = (alliance.seats / TOTAL_PARLIAMENT_SEATS) * 100;
      const sweepAngle = (alliance.seats / TOTAL_PARLIAMENT_SEATS) * 180; // 180 degrees for semicircle
      
      // Calculate label position (OUTSIDE the donut, like the reference image)
      const midAngle = startAngle + (sweepAngle / 2);
      const midAngleRad = (midAngle * Math.PI) / 180;
      const labelRadius = 130; // Position labels outside
      const labelX = 150 + labelRadius * Math.cos(midAngleRad);
      const labelY = 150 + labelRadius * Math.sin(midAngleRad);
      
      // Determine text anchor based on angle
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (midAngle < -135) textAnchor = 'end';
      else if (midAngle > -45) textAnchor = 'start';
      
      const segment = {
        ...alliance,
        percentage,
        startAngle,
        sweepAngle,
        labelX,
        labelY,
        textAnchor,
      };
      
      startAngle += sweepAngle;
      return segment;
    });
  }, [allianceSeatCounts, totalSeats]);

  // Function to create SVG path for donut segment
  const createArc = (startAngle: number, sweepAngle: number, innerRadius: number, outerRadius: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = ((startAngle + sweepAngle) * Math.PI) / 180;
    
    const x1 = 150 + outerRadius * Math.cos(startAngleRad);
    const y1 = 150 + outerRadius * Math.sin(startAngleRad);
    const x2 = 150 + outerRadius * Math.cos(endAngleRad);
    const y2 = 150 + outerRadius * Math.sin(endAngleRad);
    
    const x3 = 150 + innerRadius * Math.cos(endAngleRad);
    const y3 = 150 + innerRadius * Math.sin(endAngleRad);
    const x4 = 150 + innerRadius * Math.cos(startAngleRad);
    const y4 = 150 + innerRadius * Math.sin(startAngleRad);
    
    const largeArc = sweepAngle > 180 ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  return (
    <div className="relative w-full flex items-center justify-center py-8">
      {/* SVG Container - minimal design */}
      <div className="relative w-full max-w-[650px]">
        <svg
          viewBox="0 0 500 250"
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Donut segments */}
          {segments.map((segment) => (
            <g key={segment.allianceId}>
              {/* Segment path */}
              <path
                d={createArc(segment.startAngle, segment.sweepAngle, 70, 115)}
                fill={segment.allianceColor}
                className="transition-all duration-300 hover:opacity-80"
                stroke="none"
                transform="translate(100, 30)"
              >
                <title>{`${segment.allianceName}: ${segment.seats} seats`}</title>
              </path>
              
              {/* Alliance name and seats outside (only show if seats > 0) */}
              {segment.seats > 0 && (
                <text
                  x={segment.labelX + 100}
                  y={segment.labelY + 30}
                  textAnchor={segment.textAnchor}
                  className="fill-gray-800 dark:fill-gray-200 font-semibold pointer-events-none select-none"
                  style={{ fontSize: '15px', fontWeight: '600' }}
                >
                  {segment.allianceId === 'undeclared' 
                    ? `Undeclared: ${segment.seats}`
                    : `${segment.allianceName === 'Jamaat NCP Alliance' ? 'Jamaat-NCP' : segment.allianceName.replace('-led Alliance', '').replace(' & Independents', '')}: ${segment.seats}`
                  }
                </text>
              )}
            </g>
          ))}
          
          {/* Total seats label in center */}
          <text
            x="250"
            y="170"
            textAnchor="middle"
            className="fill-gray-900 dark:fill-gray-100 font-black pointer-events-none select-none"
            style={{ fontSize: '56px', fontWeight: '900' }}
          >
            300
          </text>
          <text
            x="250"
            y="188"
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400 font-medium pointer-events-none select-none"
            style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '1px' }}
          >
            SEATS
          </text>
        </svg>
        
        {/* Legend below - minimal style */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          {segments.map((segment) => (
            <div key={segment.allianceId} className="flex items-center gap-2">
              {(segment.allianceId === 'bnp' || segment.allianceId === 'jamaat') && (
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image
                    src={segment.allianceId === 'bnp' ? '/bnp.png' : '/jamaat.png'}
                    alt={segment.allianceName}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              {(segment.allianceId === 'others' || segment.allianceId === 'undeclared') && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.allianceColor }}
                />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {segment.allianceName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
