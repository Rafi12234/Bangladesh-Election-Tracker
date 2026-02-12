'use client';

import { useMemo, memo } from 'react';
import Image from 'next/image';
import type { AllianceSeatCount } from '@/types';

interface Props {
  allianceSeatCounts: AllianceSeatCount[];
  totalSeats: number;
}

const UNDECLARED_COLOR = '#9CA3AF'; // gray-400 - better visibility in both light and dark modes

function ParliamentSeats({ allianceSeatCounts, totalSeats }: Props) {
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
    
    const calculatedSegments = allSegments.map((alliance, index) => {
      const percentage = (alliance.seats / TOTAL_PARLIAMENT_SEATS) * 100;
      const sweepAngle = (alliance.seats / TOTAL_PARLIAMENT_SEATS) * 180; // 180 degrees for semicircle
      const isSmall = percentage < 5; // Small segments need leader lines
      
      // Calculate segment midpoint for arc connection
      const midAngle = startAngle + (sweepAngle / 2);
      const midAngleRad = (midAngle * Math.PI) / 180;
      
      // Arc connection point (on the outer edge of the donut)
      const arcRadius = 115;
      const arcX = 150 + arcRadius * Math.cos(midAngleRad);
      const arcY = 150 + arcRadius * Math.sin(midAngleRad);
      
      // Label position - move small segments further out and position strategically
      let labelRadius: number;
      let labelX: number;
      let labelY: number;
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      
      if (isSmall) {
        // Position small segments with more spacing
        labelRadius = 155;
        
        // Stack small segments vertically to avoid overlaps
        const smallSegmentIndex = allSegments.filter((s, i) => {
          const p = (s.seats / TOTAL_PARLIAMENT_SEATS) * 100;
          return p < 5 && i < index;
        }).length;
        
        // Adjust position based on location to avoid overlaps
        if (midAngle < -150) {
          // Left side - position labels to the left
          labelX = 150 + labelRadius * Math.cos(-165 * Math.PI / 180);
          labelY = 150 + labelRadius * Math.sin(-165 * Math.PI / 180) - (smallSegmentIndex * 22);
          textAnchor = 'end';
        } else if (midAngle > -30) {
          // Right side - position labels to the right
          labelX = 150 + labelRadius * Math.cos(-15 * Math.PI / 180);
          labelY = 150 + labelRadius * Math.sin(-15 * Math.PI / 180) - (smallSegmentIndex * 22);
          textAnchor = 'start';
        } else {
          // Middle - position based on segment location
          labelX = 150 + labelRadius * Math.cos(midAngleRad);
          labelY = 150 + labelRadius * Math.sin(midAngleRad) - (smallSegmentIndex * 10);
          textAnchor = midAngle < -90 ? 'end' : 'start';
        }
      } else {
        // Large segments - position normally
        labelRadius = 130;
        labelX = 150 + labelRadius * Math.cos(midAngleRad);
        labelY = 150 + labelRadius * Math.sin(midAngleRad);
        
        if (midAngle < -135) textAnchor = 'end';
        else if (midAngle > -45) textAnchor = 'start';
      }
      
      const segment = {
        ...alliance,
        percentage,
        startAngle,
        sweepAngle,
        labelX,
        labelY,
        textAnchor,
        arcX,
        arcY,
        isSmall,
      };
      
      startAngle += sweepAngle;
      return segment;
    });
    
    return calculatedSegments;
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
      <div className="relative w-full max-w-[700px]">
        <svg
          viewBox="0 0 600 280"
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
                transform="translate(150, 45)"
              >
                <title>{`${segment.allianceName}: ${segment.seats} seats`}</title>
              </path>
              
              {/* Leader line for small segments */}
              {segment.seats > 0 && segment.isSmall && (
                <polyline
                  points={`${segment.arcX + 150},${segment.arcY + 45} ${segment.labelX + 150 - (segment.textAnchor === 'end' ? 5 : segment.textAnchor === 'start' ? -5 : 0)},${segment.labelY + 45}`}
                  fill="none"
                  stroke={segment.allianceColor}
                  strokeWidth="1.5"
                  className="opacity-60"
                />
              )}
              
              {/* Alliance name and seats outside (only show if seats > 0) */}
              {segment.seats > 0 && (
                <text
                  x={segment.labelX + 150}
                  y={segment.labelY + 45}
                  textAnchor={segment.textAnchor}
                  className="fill-gray-800 dark:fill-gray-200 font-semibold pointer-events-none select-none"
                  style={{ fontSize: '14px', fontWeight: '600' }}
                >
                  {segment.allianceId === 'undeclared' 
                    ? `Undeclared: ${segment.seats}`
                    : segment.allianceId === 'jamaat'
                    ? `Jamaat-NCP: ${segment.seats}`
                    : segment.allianceId === 'bnp'
                    ? `BNP: ${segment.seats}`
                    : `Others: ${segment.seats}`
                  }
                </text>
              )}
            </g>
          ))}
          
          {/* Total seats label in center */}
          <text
            x="300"
            y="185"
            textAnchor="middle"
            className="fill-gray-900 dark:fill-gray-100 font-black pointer-events-none select-none"
            style={{ fontSize: '56px', fontWeight: '900' }}
          >
            300
          </text>
          <text
            x="300"
            y="203"
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

export default memo(ParliamentSeats);
