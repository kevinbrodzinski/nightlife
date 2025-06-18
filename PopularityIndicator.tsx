
import React from 'react';
import type { PopularityLevel } from '../types';
import { POPULARITY_COLORS, POPULARITY_TEXT_COLORS } from '../constants';

interface PopularityIndicatorProps {
  popularity: PopularityLevel;
  size?: 'small' | 'normal';
}

const CrowdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.028.658a.78.78 0 01-.358.442A2.997 2.997 0 011.49 15.326zM16 8a2 2 0 11-4 0 2 2 0 014 0zM10 14a5 5 0 015-5h2a7 7 0 00-7-7H5a7 7 0 00-7 7h2a5 5 0 015 5v1.257a3.5 3.5 0 01-1.62.404c-.08.02-.158.042-.238.068a.78.78 0 00-.358.442 2.997 2.997 0 002.923 3.635 3.5 3.5 0 011.62-.404V14zM18.51 15.326a.78.78 0 00.358-.442 3 3 0 00-4.308-3.516C13.163 12.69 14 13.978 14 15.5c0 .052.002.101.005.15H14a1 1 0 00-1 1v.538a3.481 3.481 0 001.62.404c.08.02.158.042.238.068a.78.78 0 00.358.442 2.997 2.997 0 002.292-3.635z" />
  </svg>
);


export const PopularityIndicator: React.FC<PopularityIndicatorProps> = ({ popularity, size = 'normal' }) => {
  const colorClass = POPULARITY_COLORS[popularity] || 'bg-gray-500 text-white';
  const textColorClass = POPULARITY_TEXT_COLORS[popularity] || 'text-gray-300';
  
  if (size === 'small') {
    return (
      <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <CrowdIcon className={`w-3 h-3 ${textColorClass === 'text-white' || textColorClass.includes('slate-900') ? 'text-current' : textColorClass}`} />
        <span>{popularity}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${colorClass}`}>
      <CrowdIcon className={`w-5 h-5 ${textColorClass === 'text-white' || textColorClass.includes('slate-900') ? 'text-current' : textColorClass}`} />
      <span>{popularity}</span>
    </div>
  );
};