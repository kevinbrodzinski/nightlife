
import React from 'react';
import type { Venue, UserLocation } from '../types';
import { LocationCard } from './LocationCard';
import { SkeletonLocationCard } from './SkeletonLocationCard'; // New

interface ListViewProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue) => void;
  userLocation: UserLocation | null;
  isLoading?: boolean; // New
}

export const ListView: React.FC<ListViewProps> = ({ venues, onVenueSelect, userLocation, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <SkeletonLocationCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {venues.map((venue, index) => (
        <LocationCard 
          key={venue.id} 
          venue={venue} 
          index={index} 
          onSelect={() => onVenueSelect(venue)} 
          userLocation={userLocation}
        />
      ))}
    </div>
  );
};
