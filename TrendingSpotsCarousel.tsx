
import React from 'react';
import type { Venue, UserLocation } from '../types';
import { PopularityIndicator } from './PopularityIndicator';
import { POPULARITY_BORDER_COLORS } from '../constants';

// Context Hooks
import { useVenues } from '../contexts/VenuesContext';
import { useLocation } from '../contexts/LocationContext';

interface TrendingSpotsCarouselProps {
  // venues, title, userLocation are now from context
  onVenueSelect: (venue: Venue) => void; // Keep for navigation
}

const TrendingCard: React.FC<{ venue: Venue; onSelect: () => void; }> = ({ venue, onSelect }) => {
  const popularityBorder = venue.currentPopularity ? POPULARITY_BORDER_COLORS[venue.currentPopularity] : 'border-slate-700';
  
  return (
    <div
      onClick={onSelect} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
      className={`group flex-shrink-0 w-64 sm:w-72 h-full bg-slate-800 rounded-lg shadow-md hover:shadow-xl border-l-4 ${popularityBorder} transition-all duration-200 ease-in-out cursor-pointer overflow-hidden flex flex-col`}
      aria-label={`View details for ${venue.name}`}
    >
      <img src={`${venue.bannerImage}&trending=true`} alt={`Trending: ${venue.name}`} className="w-full h-32 object-cover" loading="lazy" />
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-md font-semibold text-sky-400 group-hover:text-sky-300 transition-colors truncate mb-1">{venue.name}</h3>
        <p className="text-xs text-teal-400 font-medium mb-1 truncate">{venue.category}</p>
        {venue.currentPopularity && (<div className="my-1"><PopularityIndicator popularity={venue.currentPopularity} size="small" /></div>)}
        <p className="text-xs text-slate-400 truncate mt-auto">{venue.tags && venue.tags.length > 0 ? venue.tags.join(', ') : 'No tags'}</p>
      </div>
    </div>
  );
};

export const TrendingSpotsCarousel: React.FC<TrendingSpotsCarouselProps> = ({ onVenueSelect }) => {
  const { trendingVenuesData } = useVenues();
  // userLocation from useLocation() is available globally if needed by TrendingCard, but not directly used in this simplified version.

  if (!trendingVenuesData || !trendingVenuesData.venues || trendingVenuesData.venues.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-sky-400 mb-4">{trendingVenuesData.title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 -mb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {trendingVenuesData.venues.map((venue) => (
          <TrendingCard 
            key={`trending-${venue.id}`} 
            venue={venue} 
            onSelect={() => onVenueSelect(venue)}
          />
        ))}
      </div>
    </div>
  );
};
