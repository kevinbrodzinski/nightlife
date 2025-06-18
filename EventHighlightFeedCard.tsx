
import React from 'react';
import type { EventHighlightFeedData, Venue, UserLocation } from '../../types';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { MapPinIcon } from '../icons/MapPinIcon';

interface EventHighlightFeedCardProps {
  itemData: EventHighlightFeedData;
  allVenues: Venue[]; // To potentially link to venue detail if venueId is provided
  onSelectVenue: (venue: Venue | string) => void;
  userLocation: UserLocation | null;
}

export const EventHighlightFeedCard: React.FC<EventHighlightFeedCardProps> = ({ itemData, allVenues, onSelectVenue, userLocation }) => {
  const venue = itemData.venueId ? allVenues.find(v => v.id === itemData.venueId) : null;
  const displayVenueName = venue?.name || itemData.venueName || "Special Event Location";

  const handleCtaClick = () => {
    if (venue) {
      onSelectVenue(venue);
    } else if (itemData.venueName) {
      // Potentially open a map search for itemData.venueName if it's not in our DB
      // For now, just log or do nothing if no venueId
      console.log("View event at:", itemData.venueName);
    }
  };
  
  const ctaText = venue ? "View Venue" : (itemData.venueName ? "Find Location (Placeholder)" : "Learn More");

  return (
    <article className="bg-slate-800 rounded-xl shadow-xl overflow-hidden group transition-all hover:shadow-2xl">
      {itemData.imageUrl && (
        <div className="relative h-48">
            <img 
            src={itemData.imageUrl} 
            alt={`Event: ${itemData.eventName}`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            loading="lazy"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
      )}
      <div className="p-4 md:p-5">
        <h3 className="text-xl font-bold text-sky-400 mb-1.5">{itemData.eventName}</h3>
        
        <div className="space-y-1 text-sm text-slate-300 mb-3">
            <div className="flex items-center text-teal-400">
                <CalendarDaysIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{itemData.date}</span>
                {itemData.time && <span className="mx-1">|</span>}
                {itemData.time && (
                    <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>{itemData.time}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center text-slate-400">
                <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{displayVenueName}</span>
                {userLocation && venue && venue.distanceInMiles !== undefined && (
                    <span className="text-xs text-slate-500 ml-2">({venue.distanceInMiles.toFixed(1)} mi away)</span>
                )}
            </div>
        </div>

        <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">{itemData.description}</p>
        
        <button
          onClick={handleCtaClick}
          className="inline-flex items-center text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors group/cta"
        >
          {ctaText}
          <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover/cta:translate-x-1" />
        </button>
      </div>
    </article>
  );
};
