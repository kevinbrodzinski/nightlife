
import React from 'react';
import type { Venue } from '../types';
import { PopularityIndicator } from './PopularityIndicator';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface VenueSuggestionCardProps {
  venue: Venue;
  onAdd: () => void;
  onMoreInfo: () => void;
  planIsFull: boolean;
  isAdded?: boolean; // Optional: to show if it's already in the current plan
}

export const VenueSuggestionCard: React.FC<VenueSuggestionCardProps> = ({ venue, onAdd, onMoreInfo, planIsFull, isAdded }) => {
  return (
    <div className="bg-slate-600/50 p-3 rounded-lg shadow-sm w-full max-w-xs sm:max-w-sm hover:bg-slate-500/50 transition-colors">
      <div className="flex space-x-3">
        <img 
            src={`${venue.bannerImage}&suggestion=true`} 
            alt={venue.name} 
            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            loading="lazy"
        />
        <div className="flex-grow min-w-0"> {/* min-w-0 for truncation */}
          <h4 className="text-sm font-semibold text-sky-300 truncate">{venue.name}</h4>
          <p className="text-xs text-teal-300 truncate">{venue.category}</p>
          {venue.currentPopularity && (
            <div className="mt-1">
              <PopularityIndicator popularity={venue.currentPopularity} size="small" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex space-x-2">
        <button
          onClick={onAdd}
          disabled={planIsFull || isAdded}
          className="flex-1 flex items-center justify-center px-2.5 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors disabled:bg-slate-500 disabled:opacity-70 disabled:cursor-not-allowed"
          aria-label={`Add ${venue.name} to plan`}
        >
          <PlusCircleIcon className="w-4 h-4 mr-1" />
          {isAdded ? 'Added' : (planIsFull ? 'Plan Full' : 'Add to Plan')}
        </button>
        <button
          onClick={onMoreInfo}
          className="flex-1 flex items-center justify-center px-2.5 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium transition-colors"
          aria-label={`More information about ${venue.name}`}
        >
          <InformationCircleIcon className="w-4 h-4 mr-1" />
          More Info
        </button>
      </div>
    </div>
  );
};
