
import React from 'react';
import { MapPinIcon } from './icons/MapPinIcon';
// import { WifiIcon } from './icons/WifiIcon'; // Assuming WifiIcon exists or will be created
import { XCircleIcon } from './icons/XCircleIcon';

interface LocationInputFieldsProps {
  lat: string;
  lon: string;
  setLat: (val: string) => void;
  setLon: (val: string) => void;
  isUsingManual: boolean;
  setIsUsingManual: (isManual: boolean) => void;
  gpsPermissionDenied: boolean;
  onUseGPS: () => void; // Callback to signal App.tsx to switch to GPS
}

// Create a simple WifiIcon if not available, or import if it exists
const WifiIconLocal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856a8.25 8.25 0 0 1 13.788 0M1.924 8.674a12 12 0 0 1 20.152 0M12.75 20.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    </svg>
);


export const LocationInputFields: React.FC<LocationInputFieldsProps> = ({
  lat,
  lon,
  setLat,
  setLon,
  isUsingManual,
  setIsUsingManual,
  gpsPermissionDenied,
  onUseGPS
}) => {
  
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, minus, dot, and numbers. Restrict to valid float pattern.
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      setLat(value);
    }
  };

  const handleLonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      setLon(value);
    }
  };
  
  const handleApplyManual = () => {
    // Basic validation for demonstration. More robust validation (range) can be added.
    if (lat.trim() !== '' && lon.trim() !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
      setIsUsingManual(true);
    } else {
      // Potentially show error if fields are invalid but user tries to "Apply Manual"
      // For now, it just won't set `isUsingManual` to true if fields are empty/invalid
      if (lat.trim() === '' || lon.trim() === '') {
        alert("Please enter both latitude and longitude.");
      } else {
        alert("Latitude or Longitude is invalid.");
      }
    }
  };

  const handleClearManual = () => {
    setLat('');
    setLon('');
    setIsUsingManual(false); // Switch off manual mode
  };
  
  const handleUseGPS = () => {
    setIsUsingManual(false); // Switch off manual mode
    onUseGPS(); // Inform parent to try using GPS
  };

  return (
    <div className="space-y-4 p-3 bg-slate-700/50 rounded-lg">
      <label className="block text-sm font-medium text-slate-300 mb-2">Location Focus</label>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useManualLocationCheckbox"
          checked={isUsingManual}
          onChange={(e) => setIsUsingManual(e.target.checked)}
          className="h-4 w-4 rounded border-slate-500 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
        <label htmlFor="useManualLocationCheckbox" className="text-sm text-slate-300 cursor-pointer">
          Set Manually (Overrides GPS)
        </label>
      </div>

      {isUsingManual && (
        <div className="space-y-3 pl-1 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <label htmlFor="manualLat" className="block text-xs font-medium text-slate-400 mb-0.5">Latitude (-90 to 90)</label>
              <input
                type="text"
                id="manualLat"
                value={lat}
                onChange={handleLatChange}
                placeholder="e.g., 34.052235"
                className="block w-full py-2 px-2.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label htmlFor="manualLon" className="block text-xs font-medium text-slate-400 mb-0.5">Longitude (-180 to 180)</label>
              <input
                type="text"
                id="manualLon"
                value={lon}
                onChange={handleLonChange}
                placeholder="e.g., -118.243683"
                className="block w-full py-2 px-2.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
           {/* Apply button is removed from here; parent modal's Apply Filters handles it */}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
         <button
          onClick={handleUseGPS}
          disabled={gpsPermissionDenied && !isUsingManual} // Disable if permission denied and not already using manual
          className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <WifiIconLocal className="w-4 h-4 mr-1.5" />
          Use My GPS
        </button>
        <button
          onClick={handleClearManual}
          disabled={!lat && !lon && !isUsingManual} // Disable if no manual input and not in manual mode
          className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <XCircleIcon className="w-4 h-4 mr-1.5" />
          Clear Manual Location
        </button>
      </div>
      {gpsPermissionDenied && !isUsingManual && (
        <p className="text-xs text-yellow-400 mt-1">GPS permission denied. Set location manually or grant permission via browser settings.</p>
      )}
       {!isUsingManual && !gpsPermissionDenied && (
        <p className="text-xs text-slate-400 mt-1">Using current GPS location if available. Check "Set Manually" to override.</p>
      )}
    </div>
  );
};
