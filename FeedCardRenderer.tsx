
import React from 'react';
import type { FeedItem, Venue, UserLocation } from '../types'; // Corrected path
import { FeedItemType } from '../types'; // Corrected path
import { TrendingVenueFeedCard } from './feed_cards/TrendingVenueFeedCard';
import { CuratedListFeedCard } from './feed_cards/CuratedListFeedCard';
import { EventHighlightFeedCard } from './feed_cards/EventHighlightFeedCard';
import { TipArticleFeedCard } from './feed_cards/TipArticleFeedCard';
import { AIRecommendationFeedCard } from './feed_cards/AIRecommendationFeedCard';

interface FeedCardRendererProps {
  item: FeedItem;
  allVenues: Venue[];
  onSelectVenue: (venue: Venue | string) => void;
  onShare?: (title: string, text: string, url: string) => Promise<void>;
  userLocation: UserLocation | null;
}

export const FeedCardRenderer: React.FC<FeedCardRendererProps> = ({ 
    item, 
    allVenues, 
    onSelectVenue,
    onShare,
    userLocation
}) => {
  switch (item.type) {
    case FeedItemType.TRENDING_VENUE:
      return (
        <TrendingVenueFeedCard 
            itemData={item.data} 
            allVenues={allVenues} 
            onSelectVenue={onSelectVenue} 
            userLocation={userLocation}
        />
      );
    case FeedItemType.CURATED_LIST:
      return (
        <CuratedListFeedCard 
            itemData={item.data} 
            allVenues={allVenues} 
            onSelectVenue={onSelectVenue} 
            userLocation={userLocation}
        />
      );
    case FeedItemType.EVENT_HIGHLIGHT:
      return (
        <EventHighlightFeedCard 
            itemData={item.data} 
            allVenues={allVenues} 
            onSelectVenue={onSelectVenue} 
            userLocation={userLocation}
        />
      );
    case FeedItemType.TIP_ARTICLE:
      return <TipArticleFeedCard itemData={item.data} />;
    case FeedItemType.AI_RECOMMENDATION:
      return (
        <AIRecommendationFeedCard 
            itemData={item.data} 
            allVenues={allVenues} 
            onSelectVenue={onSelectVenue} 
            userLocation={userLocation}
        />
      );
    default:
      // This case should ideally be unreachable if all FeedItemTypes are handled.
      // TypeScript infers 'item' as 'never' here.
      const exhaustiveCheck: never = item; 
      console.warn("Unhandled feed item type in renderer. This should not happen if all variants are covered:", exhaustiveCheck);
      return (
        <div className="p-4 bg-slate-700 rounded-lg text-red-400">
          Error: Unknown feed card type. Please report this issue.
        </div>
      );
  }
};
