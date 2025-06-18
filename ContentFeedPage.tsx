import React from 'react';
import type { Venue, UserLocation } from '../types'; // Keep UserLocation if onShare needs it
import { FeedCardRenderer } from './FeedCardRenderer';
import { SparklesIcon } from './icons/SparklesIcon';

// Context Hooks
import { useVenues } from '../contexts/VenuesContext';
import { useLocation } from '../contexts/LocationContext';

interface ContentFeedPageProps {
  // feedItems, allVenues, userLocation are now from context
  onSelectVenue: (venue: Venue | string) => void; // Keep for navigation
  onShare?: (title: string, text: string, url: string) => Promise<void>; // Keep for share UI
}

export const ContentFeedPage: React.FC<ContentFeedPageProps> = ({ 
    onSelectVenue,
    onShare,
}) => {
  const { feedItems, initialVenues: allVenues } = useVenues(); // Using initialVenues as allVenues for cards
  const { effectiveLocation } = useLocation();

  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-slate-800 rounded-xl shadow-lg animate-fadeIn">
        <SparklesIcon className="mx-auto h-16 w-16 text-slate-500 mb-4" />
        <h3 className="text-2xl font-semibold text-slate-300 mb-2">Feed is Empty</h3>
        <p className="text-slate-400">No new updates or highlights right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-8">
        <div className="text-center pt-4 pb-2">
             <h1 className="text-3xl font-bold text-sky-400 mb-2">Nightlife Feed</h1>
             <p className="text-slate-400">Trending spots, tips, and what's happening tonight.</p>
        </div>
      {feedItems.map((item) => (
        <FeedCardRenderer 
            key={item.id} 
            item={item} 
            allVenues={allVenues} 
            onSelectVenue={onSelectVenue}
            onShare={onShare}
            userLocation={effectiveLocation}
        />
      ))}
    </div>
  );
};
