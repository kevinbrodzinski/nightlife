import React from 'react';
import { SearchBar } from './SearchBar';
import { ViewToggle } from './ViewToggle';
import { SUGGESTION_CHIPS, TIME_SLOTS } from '../constants';
import { formatISODateForDisplay } from '../utils/date';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { useFilters } from '../contexts/FiltersContext'; // Import useFilters

interface FilterControlsProps {
  // activityQuery and setActivityQuery are now from FiltersContext
  currentView: 'list' | 'map';
  setCurrentView: (view: 'list' | 'map') => void;
  onOpenFilterModal: () => void;
  // selectedDay, selectedTime, activeFilterCount are from FiltersContext
  disableViewToggle?: boolean;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  currentView,
  setCurrentView,
  onOpenFilterModal,
  disableViewToggle = false,
}) => {
  const { 
    activityQuery, 
    setActivityQuery, 
    selectedDay, 
    selectedTime, 
    activeAdvancedFilterCount 
  } = useFilters();

  const selectedDayLabel = formatISODateForDisplay(selectedDay, 'dayLabel');
  const selectedTimeLabel = TIME_SLOTS.find(t => t.value === selectedTime)?.label || selectedTime;

  const filterButtonBaseClasses = "flex-grow w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-3 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-between";
  const activeFilterButtonClasses = activeAdvancedFilterCount > 0 ? "border-2 border-teal-500" : "border-2 border-transparent";

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl mb-6 sm:mb-8 space-y-6">
      <SearchBar activityQuery={activityQuery} setActivityQuery={setActivityQuery} />
      
      <div>
        <p className="text-xs text-slate-400 mb-2 text-center sm:text-left">Or try these popular searches:</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          {SUGGESTION_CHIPS.map(chip => (
            <button
              key={chip.query}
              onClick={() => setActivityQuery(chip.query)}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                ${activityQuery.toLowerCase() === chip.query.toLowerCase() 
                  ? 'bg-teal-500 text-white shadow-md focus:ring-teal-400' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-100 focus:ring-teal-500'}`}
            >
              {chip.icon && <span className="mr-1.5">{chip.icon}</span>}
              {chip.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <button
          onClick={onOpenFilterModal}
          className={`${filterButtonBaseClasses} ${activeFilterButtonClasses}`}
        >
          <div className="flex items-center">
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-teal-400" />
            <span>
              Filters: {selectedDayLabel} at {selectedTimeLabel}
            </span>
          </div>
          {activeAdvancedFilterCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeAdvancedFilterCount}
            </span>
          )}
        </button>
        <ViewToggle 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          disabled={disableViewToggle}
        />
      </div>
    </div>
  );
};
