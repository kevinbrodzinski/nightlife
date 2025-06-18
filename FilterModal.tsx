
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PopularityLevel, UserLocation } from '../types'; 
import { DayTimePicker } from './DayTimePicker';
import { MultiSelectChipGroup } from './MultiSelectChipGroup';
import { SingleSelectChipGroup } from './SingleSelectChipGroup';
import { XMarkIcon } from './icons/XMarkIcon';
import { VENUE_TYPES, VIBE_OPTIONS, FEATURE_OPTIONS, POPULARITY_LEVEL_OPTIONS, DISTANCE_OPTIONS } from '../constants';
import { LocationInputFields } from './LocationInputFields';
import { useFilters, AppliedFiltersArgs } from '../contexts/FiltersContext'; // Import useFilters
import { useLocation } from '../contexts/LocationContext'; // Import useLocation


interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onApplyFilters is now from context
  // initialFilters are from context
  // defaultDay, defaultTime are from context
  // currentManualLocation, isCurrentlyUsingManualLocation, locationPermissionDenied are from context
  locationPermissionDenied: boolean; // Still useful to pass directly if App.tsx has it for other UI logic
}

export const FilterModal: React.FC<FilterModalProps> = ({ 
    isOpen, 
    onClose, 
    locationPermissionDenied // This prop can remain as it's a direct status, though LocationContext also has it
}) => {
  const { 
    selectedDay, selectedTime, selectedVenueTypes, selectedVibes, selectedFeatures, 
    selectedCrowdLevels, selectedDistance, handleApplyFilters: contextApplyFilters,
    defaultDay: contextDefaultDay, defaultTime: contextDefaultTime
  } = useFilters();
  
  const { 
    manualLocation: contextManualLocation, 
    isUsingManualLocation: contextIsUsingManual,
    locationPermissionDenied: contextLocationPermissionDenied,
    setManualLocation, // Needed for LocationInputFields
    setIsUsingManualLocation // Needed for LocationInputFields
  } = useLocation();

  // Temporary state for modal interaction, initialized from context
  const [tempDay, setTempDay] = useState(selectedDay);
  const [tempTime, setTempTime] = useState(selectedTime);
  const [tempVenueTypes, setTempVenueTypes] = useState<string[]>(selectedVenueTypes);
  const [tempVibes, setTempVibes] = useState<string[]>(selectedVibes);
  const [tempFeatures, setTempFeatures] = useState<string[]>(selectedFeatures);
  const [tempCrowdLevels, setTempCrowdLevels] = useState<PopularityLevel[]>(selectedCrowdLevels);
  const [tempDistance, setTempDistance] = useState<string>(selectedDistance);
  
  // State specific to the modal's instance of LocationInputFields
  const [modalManualLat, setModalManualLat] = useState<string>(contextManualLocation?.lat?.toString() || '');
  const [modalManualLon, setModalManualLon] = useState<string>(contextManualLocation?.lon?.toString() || '');
  const [modalIsUsingManualLocation, setModalIsUsingManualLocation] = useState<boolean>(contextIsUsingManual);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);


  useEffect(() => {
    if (isOpen) {
        setTempDay(selectedDay);
        setTempTime(selectedTime);
        setTempVenueTypes(selectedVenueTypes);
        setTempVibes(selectedVibes);
        setTempFeatures(selectedFeatures);
        setTempCrowdLevels(selectedCrowdLevels);
        setTempDistance(selectedDistance);
        setModalManualLat(contextManualLocation?.lat?.toString() || '');
        setModalManualLon(contextManualLocation?.lon?.toString() || '');
        setModalIsUsingManualLocation(contextIsUsingManual);
        
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
        // Focus the close button when modal opens for accessibility
        closeButtonRef.current?.focus();

    } else if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
    }
  }, [isOpen, selectedDay, selectedTime, selectedVenueTypes, selectedVibes, selectedFeatures, 
      selectedCrowdLevels, selectedDistance, contextManualLocation, contextIsUsingManual]);

  const handleApply = () => {
    let manualLocationInputForApply: UserLocation | null = null;
    let applyManualFlag = modalIsUsingManualLocation;

    if (modalIsUsingManualLocation) {
        const lat = parseFloat(modalManualLat);
        const lon = parseFloat(modalManualLon);
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            manualLocationInputForApply = { lat, lon };
        } else {
            applyManualFlag = false; 
            console.warn("Manual location input is invalid, not applying.");
        }
    }

    const filtersToApply: AppliedFiltersArgs = {
      day: tempDay, time: tempTime, venueTypes: tempVenueTypes, vibes: tempVibes,
      features: tempFeatures, crowdLevels: tempCrowdLevels, distance: tempDistance,
      manualLocationInput: applyManualFlag ? manualLocationInputForApply : null,
    };
    contextApplyFilters(filtersToApply);
    onClose(); // Close modal after applying
  };

  const handleReset = () => {
    setTempDay(contextDefaultDay());
    setTempTime(contextDefaultTime());
    setTempVenueTypes([]);
    setTempVibes([]);
    setTempFeatures([]);
    setTempCrowdLevels([]);
    setTempDistance('any');
    setModalManualLat('');
    setModalManualLon('');
    setModalIsUsingManualLocation(false);
  };
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
     // Basic focus trapping (can be enhanced)
    if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ) as HTMLElement[];
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const canUseDistanceFilter = !contextLocationPermissionDenied || (modalIsUsingManualLocation && !!modalManualLat && !!modalManualLon && !isNaN(parseFloat(modalManualLat)) && !isNaN(parseFloat(modalManualLon)));

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-40 flex justify-end animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="filter-modal-title">
      <div ref={modalRef} className="w-full max-w-md h-full bg-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <h2 id="filter-modal-title" className="text-xl font-semibold text-sky-400">Refine Your Search</h2>
          <button ref={closeButtonRef} onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800" aria-label="Close filter modal"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
          <DayTimePicker selectedDay={tempDay} setSelectedDay={setTempDay} selectedTime={tempTime} setSelectedTime={setTempTime} />
          <LocationInputFields
            lat={modalManualLat} lon={modalManualLon} setLat={setModalManualLat} setLon={setModalManualLon}
            isUsingManual={modalIsUsingManualLocation} setIsUsingManual={setModalIsUsingManualLocation}
            gpsPermissionDenied={contextLocationPermissionDenied}
            onUseGPS={() => {
              setModalIsUsingManualLocation(false); setModalManualLat(''); setModalManualLon('');
              // Inform LocationContext to attempt GPS use if necessary (though it does this on init)
              // For now, this just updates modal state. LocationContext's effect handles the rest.
            }}
          />
          <MultiSelectChipGroup label="Venue Type" options={VENUE_TYPES} selectedValues={tempVenueTypes} onChange={setTempVenueTypes} />
          <MultiSelectChipGroup label="Vibe" options={VIBE_OPTIONS} selectedValues={tempVibes} onChange={setTempVibes} />
          <MultiSelectChipGroup label="Features" options={FEATURE_OPTIONS} selectedValues={tempFeatures} onChange={setTempFeatures} />
          <MultiSelectChipGroup label="Crowd Level" options={POPULARITY_LEVEL_OPTIONS} selectedValues={tempCrowdLevels} onChange={(newVals) => setTempCrowdLevels(newVals as PopularityLevel[])} />
          <SingleSelectChipGroup label="Distance" options={DISTANCE_OPTIONS} selectedValue={tempDistance} onChange={setTempDistance} disabled={!canUseDistanceFilter} note={!canUseDistanceFilter ? "Set manual location or enable GPS." : undefined } />
        </div>
        <div className="p-4 sm:p-6 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button onClick={handleReset} className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 w-full sm:w-auto">Reset Filters</button>
          <button onClick={handleApply} className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 w-full sm:w-auto">Apply Filters</button>
        </div>
      </div>
    </div>
  );
};
