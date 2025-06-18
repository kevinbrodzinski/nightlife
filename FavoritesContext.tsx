import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useMemo } from 'react';
import type { FavoriteVenueSetting, SavedDayVenue, Venue } from '../types';
import { useToast } from './ToastContext';
import { useVenues } from './VenuesContext'; // To get venue names for toasts

interface FavoritesContextType {
  favoriteVenueSettings: FavoriteVenueSetting[];
  savedDayVenues: SavedDayVenue[];
  handleToggleFavorite: (venueId: string) => void;
  handleToggleVenueNotification: (venueId: string) => void;
  handleClearAllFavorites: () => void;
  isVenueFavorite: (venueId: string) => boolean;
  handleSaveVenueForDay: (venueId: string, dayOfWeek: string, notes?: string) => void;
  handleRemoveSavedVenueForDay: (venueId: string, dayOfWeek: string) => void;
  getVenueSaveDetailsForDay: (venueId: string, dayOfWeek: string) => SavedDayVenue | undefined;
  getDaysVenueIsSavedFor: (venueId: string) => Array<{ day: string, notes?: string }>;
  favoritedVenuesDetails: (Venue & { isNotificationEnabled: boolean })[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { getVenueById, processedVenues } = useVenues(); 

  const [favoriteVenueSettings, setFavoriteVenueSettings] = useState<FavoriteVenueSetting[]>(() => {
    const savedFavorites = localStorage.getItem('nightlifeFinderFavoriteSettings');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [savedDayVenues, setSavedDayVenues] = useState<SavedDayVenue[]>(() => {
    const dayVenuesStr = localStorage.getItem('nightlifeFinderSavedDayVenues');
    return dayVenuesStr ? JSON.parse(dayVenuesStr) : [];
  });

  useEffect(() => {
    localStorage.setItem('nightlifeFinderFavoriteSettings', JSON.stringify(favoriteVenueSettings));
  }, [favoriteVenueSettings]);

  useEffect(() => {
    localStorage.setItem('nightlifeFinderSavedDayVenues', JSON.stringify(savedDayVenues));
  }, [savedDayVenues]);

  const handleToggleFavorite = useCallback((venueId: string) => {
    setFavoriteVenueSettings(prevSettings => {
      const existingSetting = prevSettings.find(setting => setting.id === venueId);
      if (existingSetting) {
        showToast("Removed from favorites.", "success");
        return prevSettings.filter(setting => setting.id !== venueId);
      } else {
        showToast("Added to favorites!", "success");
        return [...prevSettings, { id: venueId, notify: true }];
      }
    });
  }, [showToast]);

  const handleToggleVenueNotification = useCallback((venueId: string) => {
    setFavoriteVenueSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === venueId ? { ...setting, notify: !setting.notify } : setting
      )
    );
  }, []);

  const handleClearAllFavorites = useCallback(() => {
    setFavoriteVenueSettings([]);
    showToast("All general favorites cleared.", "success");
  }, [showToast]);

  const isVenueFavorite = useCallback((venueId: string): boolean => {
    return favoriteVenueSettings.some(setting => setting.id === venueId);
  }, [favoriteVenueSettings]);

  const handleSaveVenueForDay = useCallback((venueId: string, dayOfWeek: string, notes?: string) => {
    setSavedDayVenues(prev => {
      const existingIndex = prev.findIndex(sdv => sdv.venueId === venueId && sdv.dayOfWeek === dayOfWeek);
      let updatedVenues = [...prev];
      const venueName = getVenueById(venueId)?.name || 'Venue';
      if (existingIndex > -1) {
        updatedVenues[existingIndex] = { ...updatedVenues[existingIndex], notes: notes || '', savedAt: new Date().toISOString() };
        showToast(`Notes for ${venueName} on ${dayOfWeek}s updated!`, "success");
      } else {
        updatedVenues.push({ venueId, dayOfWeek, notes: notes || '', savedAt: new Date().toISOString() });
        showToast(`${venueName} saved for ${dayOfWeek}s!`, "success");
      }
      return updatedVenues;
    });
  }, [showToast, getVenueById]);

  const handleRemoveSavedVenueForDay = useCallback((venueId: string, dayOfWeek: string) => {
    const venueName = getVenueById(venueId)?.name || 'Venue';
    setSavedDayVenues(prev => prev.filter(sdv => !(sdv.venueId === venueId && sdv.dayOfWeek === dayOfWeek)));
    showToast(`${venueName} removed from ${dayOfWeek}s.`, "success");
  }, [showToast, getVenueById]);

  const getVenueSaveDetailsForDay = useCallback((venueId: string, dayOfWeek: string): SavedDayVenue | undefined => {
    return savedDayVenues.find(sdv => sdv.venueId === venueId && sdv.dayOfWeek === dayOfWeek);
  }, [savedDayVenues]);
  
  const getDaysVenueIsSavedFor = useCallback((venueId: string): Array<{ day: string, notes?: string }> => {
    return savedDayVenues
      .filter(sdv => sdv.venueId === venueId)
      .map(sdv => ({ day: sdv.dayOfWeek, notes: sdv.notes }));
  }, [savedDayVenues]);

  const favoritedVenuesDetails = useMemo(() => {
    return processedVenues
      .filter(venue => favoriteVenueSettings.some(setting => setting.id === venue.id))
      .map(venue => {
          const setting = favoriteVenueSettings.find(s => s.id === venue.id);
          return {
            ...venue,
            isNotificationEnabled: setting?.notify ?? false,
          };
      })
      .sort((a, b) => (b.currentPopularityScore || 0) - (a.currentPopularityScore || 0));
  }, [processedVenues, favoriteVenueSettings]);


  return (
    <FavoritesContext.Provider value={{
      favoriteVenueSettings,
      savedDayVenues,
      handleToggleFavorite,
      handleToggleVenueNotification,
      handleClearAllFavorites,
      isVenueFavorite,
      handleSaveVenueForDay,
      handleRemoveSavedVenueForDay,
      getVenueSaveDetailsForDay,
      getDaysVenueIsSavedFor,
      favoritedVenuesDetails,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};