import React, { createContext, useState, useEffect, useMemo, useContext, ReactNode, useCallback } from 'react';
import type { Venue, UserLocation, FeedItem, PopularityLevel } from '../types';
import { useVenueData } from '../hooks/useVenueData';
import { useFilters } from './FiltersContext';
import { useLocation } from './LocationContext';
import { getDistanceInMiles } from '../utils/distance';
import { getDayOfWeekFromISODate, formatISODateForDisplay } from '../utils/date';
import { POPULARITY_ORDER, SAMPLE_FEED_DATA } from '../constants';
import { FeedItemType, PopularityLevel as PopularityLevelEnum } from '../types';


interface VenuesContextType {
  initialVenues: Venue[];
  isLoadingVenues: boolean;
  venueError: string | null;
  processedVenues: Venue[];
  filteredVenues: Venue[];
  topVenuesForList: Venue[];
  trendingVenuesData: { title: string; venues: Venue[] };
  feedItems: FeedItem[];
  getVenueById: (id: string) => Venue | undefined;
}

const VenuesContext = createContext<VenuesContextType | undefined>(undefined);

export const VenuesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { venues: rawInitialVenues, isLoading: isLoadingRawVenues, error: rawVenueError } = useVenueData();
  const { 
    selectedDay, selectedTime, activityQuery, selectedVenueTypes, 
    selectedVibes, selectedFeatures, selectedCrowdLevels, selectedDistance 
  } = useFilters();
  const { effectiveLocation } = useLocation();
  
  const getPopularityScore = useCallback((level?: PopularityLevel): number => {
    if (!level) return 0;
    return POPULARITY_ORDER.indexOf(level);
  }, []);

  const processedVenues = useMemo((): Venue[] => {
    const dayOfWeekForPopularity = getDayOfWeekFromISODate(selectedDay);
    return rawInitialVenues.map(venue => {
      const dayPopularity = venue.historicalPopularity[dayOfWeekForPopularity];
      const currentPopularity = dayPopularity ? dayPopularity[selectedTime] : undefined;
      let distanceInMilesValue: number | undefined = undefined;
      if (effectiveLocation && venue.latitude && venue.longitude) {
        distanceInMilesValue = getDistanceInMiles(
          effectiveLocation.lat,
          effectiveLocation.lon,
          venue.latitude,
          venue.longitude
        );
      }
      return {
        ...venue,
        currentPopularity: currentPopularity,
        currentPopularityScore: getPopularityScore(currentPopularity),
        distanceInMiles: distanceInMilesValue,
      };
    });
  }, [rawInitialVenues, selectedDay, selectedTime, getPopularityScore, effectiveLocation]);

  const filteredVenues = useMemo((): Venue[] => {
    let venues = processedVenues;
    if (activityQuery.trim() !== '') {
      const lowerQuery = activityQuery.toLowerCase();
      venues = venues.filter(venue =>
        venue.name.toLowerCase().includes(lowerQuery) ||
        venue.category.toLowerCase().includes(lowerQuery) ||
        venue.description.toLowerCase().includes(lowerQuery) ||
        venue.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    if (selectedVenueTypes.length > 0) {
      venues = venues.filter(venue => selectedVenueTypes.includes(venue.category));
    }
    if (selectedVibes.length > 0) {
      venues = venues.filter(venue => 
        selectedVibes.some(vibe => venue.tags.map(t => t.toLowerCase()).includes(vibe.toLowerCase()))
      );
    }
    if (selectedFeatures.length > 0) {
      venues = venues.filter(venue => 
        selectedFeatures.some(feature => venue.tags.map(t => t.toLowerCase()).includes(feature.toLowerCase()))
      );
    }
    if (selectedCrowdLevels.length > 0) {
        venues = venues.filter(venue => venue.currentPopularity && selectedCrowdLevels.includes(venue.currentPopularity));
    }
    if (selectedDistance !== 'any' && effectiveLocation) { 
      const maxDistance = parseFloat(selectedDistance);
      if (!isNaN(maxDistance)) {
        venues = venues.filter(venue => 
          venue.distanceInMiles !== undefined && venue.distanceInMiles <= maxDistance
        );
      }
    }
    return venues.sort((a, b) => (b.currentPopularityScore || 0) - (a.currentPopularityScore || 0));
  }, [processedVenues, activityQuery, selectedVenueTypes, selectedVibes, selectedFeatures, selectedCrowdLevels, selectedDistance, effectiveLocation]);

  const topVenuesForList = useMemo(() => filteredVenues.slice(0, 10), [filteredVenues]);
  
  const trendingVenuesData = useMemo(() => {
    const dayNameForTitle = formatISODateForDisplay(selectedDay, 'dayLabel');
    return {
      title: `🔥 Trending for ${dayNameForTitle}`,
      venues: filteredVenues.slice(0, 5)
    };
  }, [filteredVenues, selectedDay]);

  const feedItems = useMemo((): FeedItem[] => {
    if (processedVenues.length < 8) { // Fallback to a smaller set of static data if not enough dynamic venues
        return SAMPLE_FEED_DATA.filter(item => 
            item.type !== FeedItemType.AI_RECOMMENDATION && (
            item.type === FeedItemType.TIP_ARTICLE || 
            item.type === FeedItemType.EVENT_HIGHLIGHT ||
            item.id === "feed-item-1" || 
            item.id === "feed-item-2" 
            )
        ).slice(0,4);
    }
    
    const sortedVenues = [...processedVenues].sort((a, b) => (b.currentPopularityScore || 0) - (a.currentPopularityScore || 0));
    const dayNameForFeed = formatISODateForDisplay(selectedDay, 'dayLabel');

    const dynamicFeedData: FeedItem[] = [
      {
        id: "feed-item-dyn-1", type: FeedItemType.TRENDING_VENUE,
        data: { venueId: sortedVenues[0].id, customTitle: `🔥 Hot on ${dayNameForFeed}: ${sortedVenues[0].name}`, highlightTag: sortedVenues[0].tags[0] || "Popular Choice" },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "feed-item-dyn-2", type: FeedItemType.CURATED_LIST,
        data: {
          title: "🍹 Top 3 Cocktail Lounges To Check Out",
          description: "Sip in style! These spots are buzzing or known for great drinks.",
          items: [
            { venueId: sortedVenues.find(v=>v.category === "Cocktail Lounge")?.id || sortedVenues[1]?.id || sortedVenues[0].id, note: "Classic Cocktails" },
            { venueId: sortedVenues.filter(v=>v.category === "Cocktail Lounge").slice(1,2)[0]?.id || sortedVenues[2]?.id || sortedVenues[1 % sortedVenues.length].id, note: "Unique Mixes" },
            { venueId: sortedVenues.find(v=>v.tags.includes("rooftop"))?.id || sortedVenues[3]?.id || sortedVenues[2 % sortedVenues.length].id, note: "Views & Vibes" },
          ].filter(item => item.venueId), // Ensure venueId is valid
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      SAMPLE_FEED_DATA.find(item => item.id === "feed-item-3")!, // Assume this static item exists
      SAMPLE_FEED_DATA.find(item => item.id === "feed-item-4")!, // Assume this static item exists
      {
        id: "feed-item-dyn-5", type: FeedItemType.AI_RECOMMENDATION,
        data: {
          title: `✨ You Might Like: ${sortedVenues[4]?.name || sortedVenues[0].name}`,
          description: `Based on spots like ${sortedVenues[5]?.name || sortedVenues[1 % sortedVenues.length].name}, this could be your next favorite!`,
          recommendedVenueIds: [sortedVenues[4]?.id || sortedVenues[0].id].filter(id => id), // Ensure ID is valid
        },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
       {
        id: "feed-item-dyn-6", type: FeedItemType.TRENDING_VENUE,
        data: { venueId: sortedVenues[1 % sortedVenues.length].id, highlightTag: sortedVenues[1 % sortedVenues.length].tags[1] || "Don't Miss Out" },
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      },
    ];
    // Filter out any items that might be undefined (e.g., if SAMPLE_FEED_DATA items are not found)
    return dynamicFeedData.filter(item => item && item.data).sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [processedVenues, selectedDay]);

  const getVenueById = useCallback((id: string): Venue | undefined => {
    return processedVenues.find(v => v.id === id);
  }, [processedVenues]);

  return (
    <VenuesContext.Provider value={{
      initialVenues: rawInitialVenues,
      isLoadingVenues: isLoadingRawVenues,
      venueError: rawVenueError,
      processedVenues,
      filteredVenues,
      topVenuesForList,
      trendingVenuesData,
      feedItems,
      getVenueById,
    }}>
      {children}
    </VenuesContext.Provider>
  );
};

export const useVenues = (): VenuesContextType => {
  const context = useContext(VenuesContext);
  if (context === undefined) {
    throw new Error('useVenues must be used within a VenuesProvider');
  }
  return context;
};