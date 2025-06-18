import React, { createContext, useState, useCallback, useContext, ReactNode, useMemo } from 'react';
import type { PopularityLevel, UserLocation } from '../types';
import { TIME_SLOTS, getTodayISODate } from '../constants';
import { useToast } from './ToastContext';
import { useLocation } from './LocationContext';

export interface AppliedFiltersArgs {
  day: string;
  time: string;
  venueTypes: string[];
  vibes: string[];
  features: string[];
  crowdLevels: PopularityLevel[];
  distance: string;
  manualLocationInput?: UserLocation | null;
}

interface FiltersContextType {
  selectedDay: string;
  selectedTime: string;
  activityQuery: string;
  selectedVenueTypes: string[];
  selectedVibes: string[];
  selectedFeatures: string[];
  selectedCrowdLevels: PopularityLevel[];
  selectedDistance: string;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
  setActivityQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedVenueTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedVibes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCrowdLevels: React.Dispatch<React.SetStateAction<PopularityLevel[]>>;
  setSelectedDistance: React.Dispatch<React.SetStateAction<string>>;
  handleApplyFilters: (newFilters: AppliedFiltersArgs) => void;
  activeAdvancedFilterCount: number;
  defaultDay: () => string;
  defaultTime: () => string;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { setManualLocation, setIsUsingManualLocation, manualLocation, isUsingManualLocation: locIsUsingManual } = useLocation();

  const defaultDay = useCallback(() => getTodayISODate(), []);
  const defaultTime = useCallback(() => {
    const currentHour = new Date().getHours();
    return TIME_SLOTS.find(t => parseInt(t.value) === currentHour)?.value || TIME_SLOTS.find(t => t.value === "19")?.value || TIME_SLOTS[0].value;
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  const [selectedTime, setSelectedTime] = useState<string>(defaultTime);
  const [activityQuery, setActivityQuery] = useState<string>('');
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCrowdLevels, setSelectedCrowdLevels] = useState<PopularityLevel[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<string>('any');

  const handleApplyFilters = useCallback((newFilters: AppliedFiltersArgs) => {
    setSelectedDay(newFilters.day);
    setSelectedTime(newFilters.time);
    setSelectedVenueTypes(newFilters.venueTypes);
    setSelectedVibes(newFilters.vibes);
    setSelectedFeatures(newFilters.features);
    setSelectedCrowdLevels(newFilters.crowdLevels);
    setSelectedDistance(newFilters.distance);

    if (newFilters.manualLocationInput !== undefined) {
      if (newFilters.manualLocationInput === null) {
        setManualLocation(null);
        setIsUsingManualLocation(false);
        showToast("Manual location cleared. Using GPS if available.", "success");
      } else {
        setManualLocation(newFilters.manualLocationInput);
        setIsUsingManualLocation(true);
        showToast("Manual location focus applied.", "success");
      }
    }
    // Note: Closing filter modal is handled in App.tsx or the modal component itself
  }, [showToast, setManualLocation, setIsUsingManualLocation]);

  const activeAdvancedFilterCount = useMemo(() => {
    return selectedVenueTypes.length +
           selectedVibes.length +
           selectedFeatures.length +
           selectedCrowdLevels.length +
           (selectedDistance !== 'any' ? 1 : 0) +
           (locIsUsingManual && manualLocation ? 1 : 0);
  }, [selectedVenueTypes, selectedVibes, selectedFeatures, selectedCrowdLevels, selectedDistance, locIsUsingManual, manualLocation]);


  return (
    <FiltersContext.Provider value={{
      selectedDay, setSelectedDay,
      selectedTime, setSelectedTime,
      activityQuery, setActivityQuery,
      selectedVenueTypes, setSelectedVenueTypes,
      selectedVibes, setSelectedVibes,
      selectedFeatures, setSelectedFeatures,
      selectedCrowdLevels, setSelectedCrowdLevels,
      selectedDistance, setSelectedDistance,
      handleApplyFilters,
      activeAdvancedFilterCount,
      defaultDay,
      defaultTime
    }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = (): FiltersContextType => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
