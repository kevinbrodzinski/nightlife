import React from 'react';
import type { Venue, UserLocation } from '../types';
import { ListView } from './ListView';
import { MapView } from './MapView';
import { useVenues } from '../contexts/VenuesContext'; // Import useVenues
import { useLocation } from '../contexts/LocationContext'; // Import useLocation

interface ResultsViewProps {
  // venues, userLocation, isLoading are now from context
  view: 'list' | 'map';
  onVenueSelect: (venue: Venue) => void; // Keep this for interaction callback
  isLoading?: boolean; // Can still be passed for overriding or specific loading scenarios
}

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  view, 
  onVenueSelect, 
  isLoading: isLoadingProp 
}) => {
  const { filteredVenues: venuesFromContext, topVenuesForList, isLoadingVenues: isLoadingVenuesFromContext } = useVenues();
  const { effectiveLocation } = useLocation();

  const isLoading = isLoadingProp !== undefined ? isLoadingProp : isLoadingVenuesFromContext;
  const venuesToDisplay = view === 'list' ? topVenuesForList : venuesFromContext;

  if (view === 'list') {
    return <ListView venues={venuesToDisplay} onVenueSelect={onVenueSelect} userLocation={effectiveLocation} isLoading={isLoading} />;
  }
  return <MapView venues={venuesToDisplay} onVenueSelect={onVenueSelect} userLocation={effectiveLocation} />;
};
