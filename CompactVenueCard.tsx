
import React from 'react';
import type { Venue, UserLocation } from '../../types';
import { PopularityIndicator } from '../PopularityIndicator';

interface CompactVenueCardProps {
  venue: Venue;
  onSelectVenue: (venue: Venue | string) => void;
  note?: string;
  userLocation: UserLocation | null; // Added, not used yet
}

export const CompactVenueCard: React.FC<CompactVenueCardProps> = ({ venue, onSelectVenue, note, userLocation }) => {
  const handleSelect = () => {
    onSelectVenue(venue);
  };

  return (
    <div
      onClick={handleSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(); }}
      role="button"
      tabIndex={0}
      className="flex-shrink-0 w-48 h-full bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer overflow-hidden flex flex-col group"
      aria-label={`View details for ${venue.name}`}
    >
      <img 
        src={`${venue.bannerImage}&compact=true`} 
        alt={venue.name} 
        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" 
        loading="lazy"
      />
      <div className="p-2.5 flex flex-col flex-grow">
        <h4 className="text-sm font-semibold text-sky-300 truncate group-hover:text-sky-200 transition-colors">{venue.name}</h4>
        <p className="text-xs text-teal-400 font-medium truncate">{venue.category}</p>
        {note && <p className="text-xs text-slate-400 italic truncate mt-0.5">{note}</p>}
        {/* Placeholder for distance if needed: 
          {userLocation && venue.distanceInMiles !== undefined && (
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {venue.distanceInMiles.toFixed(1)} mi
            </p>
          )} 
        */}
        {venue.currentPopularity && (
          <div className="mt-1.5">
            <PopularityIndicator popularity={venue.currentPopularity} size="small" />
          </div>
        )}
      </div>
    </div>
  );
};
