
import React from 'react';
import type { PopularityLevel } from '../types';
import { POPULARITY_ORDER, TIME_SLOTS, POPULARITY_LEVELS, POPULARITY_COLORS } from '../constants';

interface PeakHoursChartProps {
  hourlyPopularity: { [hour: string]: PopularityLevel };
  currentTime: string; // e.g., "19"
}

const getPopularityScore = (level?: PopularityLevel): number => {
  if (!level) return -1; // Use -1 for undefined/empty to distinguish from "Empty"
  return POPULARITY_ORDER.indexOf(level);
};

const MAX_POPULARITY_SCORE = POPULARITY_ORDER.length -1;

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ hourlyPopularity, currentTime }) => {
  const relevantTimeSlots = TIME_SLOTS; // Use all defined time slots for the chart

  return (
    <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
        <div className="flex space-x-1 h-40 items-end min-w-max px-1">
        {relevantTimeSlots.map(slot => {
            const popularityLevel = hourlyPopularity[slot.value];
            const score = getPopularityScore(popularityLevel);
            const barHeightPercentage = score >= 0 ? ((score + 1) / (MAX_POPULARITY_SCORE + 1)) * 100 : 0; // +1 to score and max_score because 0 is a valid level (Empty)
            
            const isCurrentTime = slot.value === currentTime;
            const barColor = popularityLevel ? POPULARITY_COLORS[popularityLevel].split(' ')[0] : 'bg-slate-600'; // Get only bg color
            const timeLabel = parseInt(slot.value) % 12 === 0 ? 12 : parseInt(slot.value) % 12;
            const amPm = parseInt(slot.value) < 12 || parseInt(slot.value) === 24 || parseInt(slot.value) === 0 ? 'AM' : 'PM';
            const finalLabel = `${timeLabel}${parseInt(slot.value) === 0 || parseInt(slot.value) === 12 ? '' : amPm}`;


            return (
            <div key={slot.value} className="flex flex-col items-center flex-grow min-w-[2.5rem] sm:min-w-[3rem] relative group">
                <div 
                    className={`w-full rounded-t-md transition-all duration-200 ease-in-out ${barColor} ${isCurrentTime ? 'ring-2 ring-offset-2 ring-offset-slate-700/50 ring-sky-400 shadow-lg' : 'hover:opacity-80'}`}
                    style={{ height: `${barHeightPercentage}%` }}
                    title={`${slot.label}: ${popularityLevel || 'No data'}`}
                >
                </div>
                <div className={`absolute -bottom-5 text-xs ${isCurrentTime ? 'font-bold text-sky-300' : 'text-slate-400'} group-hover:text-slate-200 transition-colors`}>
                    {finalLabel}
                </div>
                {/* Tooltip for popularity level on hover */}
                 {popularityLevel && (
                    <div className="absolute bottom-full mb-1 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {popularityLevel}
                    </div>
                )}
            </div>
            );
        })}
        </div>
        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
            {POPULARITY_LEVELS.map(level => (
                <div key={level} className="flex items-center space-x-1">
                    <span className={`w-3 h-3 rounded-sm ${POPULARITY_COLORS[level].split(' ')[0]}`}></span>
                    <span className="text-slate-400">{level}</span>
                </div>
            ))}
        </div>
    </div>
  );
};