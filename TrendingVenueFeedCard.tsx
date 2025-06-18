
import React from 'react';
import type { TrendingVenueFeedData, Venue, UserLocation } from '../../types';
import { PopularityIndicator } from '../PopularityIndicator';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { MapPinIcon } from '../icons/MapPinIcon'; // For distance display

interface TrendingVenueFeedCardProps {
  itemData: TrendingVenueFeedData;
  allVenues: Venue[];
  onSelectVenue: (venue: Venue | string) => void;
  userLocation: UserLocation | null;
}

export const TrendingVenueFeedCard: React.FC<TrendingVenueFeedCardProps> = ({ itemData, allVenues, onSelectVenue, userLocation }) => {
  const venue = allVenues.find(v => v.id === itemData.venueId);

  if (!venue) {
    return <div className="p-4 bg-slate-700 rounded-lg text-slate-400">Trending venue not found.</div>;
  }

  const handleSelect = () => {
    onSelectVenue(venue);
  };

  return (
    <article className="bg-slate-800 rounded-xl shadow-xl overflow-hidden group transition-all hover:shadow-2xl">
      <div className="relative">
        <img 
          src={`${venue.bannerImage}&feed_trending=true`} 
          alt={`Trending: ${venue.name}`} 
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        {itemData.highlightTag && (
           <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
             {itemData.highlightTag}
           </span>
        )}
         <div className="absolute bottom-0 left-0 p-4 md:p-5 w-full">
            <h3 className="text-2xl font-bold text-white drop-shadow-md">
                {itemData.customTitle || venue.name}
            </h3>
            {itemData.customTitle && <p className="text-md text-slate-200 drop-shadow-sm">{venue.name}</p>}
        </div>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
            <p className="text-teal-400 font-medium mb-1 sm:mb-0">{venue.category}</p>
            {venue.currentPopularity && <PopularityIndicator popularity={venue.currentPopularity} />}
        </div>
         {userLocation && venue.distanceInMiles !== undefined && (
          <div className="flex items-center text-xs text-slate-400 mb-2">
            <MapPinIcon className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {venue.distanceInMiles.toFixed(1)} mi away
          </div>
        )}
        <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-2">{venue.description}</p>
        <button
          onClick={handleSelect}
          className="inline-flex items-center text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors group"
        >
          View Details
          <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
};
