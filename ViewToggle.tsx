import React from 'react';
import { ListIcon } from './icons/ListIcon';
import { MapIcon } from './icons/MapIcon';

interface ViewToggleProps {
  currentView: 'list' | 'map';
  setCurrentView: (view: 'list' | 'map') => void;
  disabled?: boolean; // New prop
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, setCurrentView, disabled = false }) => {
  const commonButtonClasses = "p-3 rounded-md flex items-center justify-center space-x-2 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500";
  const activeButtonClasses = "bg-teal-600 text-white shadow-md";
  const inactiveButtonClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";
  const disabledButtonClasses = "bg-slate-600 text-slate-400 cursor-not-allowed opacity-70";

  const getButtonClasses = (viewType: 'list' | 'map') => {
    if (disabled) {
      return `${commonButtonClasses} ${disabledButtonClasses}`;
    }
    return `${commonButtonClasses} ${currentView === viewType ? activeButtonClasses : inactiveButtonClasses}`;
  };
  
  const handleClick = (view: 'list' | 'map') => {
    if (!disabled) {
      setCurrentView(view);
    }
  };

  return (
    <div className="flex items-end">
        <div className={`flex space-x-1 p-1 rounded-lg self-center sm:self-auto h-full ${disabled ? 'bg-slate-600' : 'bg-slate-700'}`}>
            <button
            onClick={() => handleClick('list')}
            className={getButtonClasses('list')}
            aria-pressed={currentView === 'list' && !disabled}
            aria-label="List View"
            disabled={disabled}
            >
            <ListIcon className="h-5 w-5" />
            <span className="hidden sm:inline">List</span>
            </button>
            <button
            onClick={() => handleClick('map')}
            className={getButtonClasses('map')}
            aria-pressed={currentView === 'map' && !disabled}
            aria-label="Map View"
            disabled={disabled}
            >
            <MapIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Map</span>
            </button>
        </div>
    </div>
  );
};
