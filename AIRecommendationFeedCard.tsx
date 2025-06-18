
import React from 'react';
import type { AIRecommendationFeedData, Venue, UserLocation } from '../../types';
import { CompactVenueCard } from './CompactVenueCard';

interface AIRecommendationFeedCardProps {
  itemData: AIRecommendationFeedData;
  allVenues: Venue[];
  onSelectVenue: (venue: Venue | string) => void;
  userLocation: UserLocation | null;
}

export const AIRecommendationFeedCard: React.FC<AIRecommendationFeedCardProps> = ({ itemData, allVenues, onSelectVenue, userLocation }) => {
  const recommendedVenues = itemData.recommendedVenueIds
    .map(id => allVenues.find(v => v.id === id))
    .filter(v => v !== undefined) as Venue[];

  if (recommendedVenues.length === 0) {
    return null; // Don't render if no valid venues found for recommendation
  }

  return (
    <div className="bg-gradient-to-br from-sky-700 via-teal-700 to-emerald-700 p-4 md:p-5 rounded-xl shadow-xl text-white">
      <h3 className="text-xl font-bold text-sky-100 mb-1">{itemData.title}</h3>
      {itemData.description && <p className="text-sm text-sky-200 mb-4 leading-relaxed">{itemData.description}</p>}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {recommendedVenues.map(venue => (
          <div key={`ai-${venue.id}`} className="flex-1 min-w-0"> {/* min-w-0 for flex truncation */}
            <CompactVenueCard 
                venue={venue} 
                onSelectVenue={onSelectVenue}
                userLocation={userLocation}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
