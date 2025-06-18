
import React from 'react';
import type { Venue, UserLocation } from '../types';
import { LocationCard } from './LocationCard';

export const MapView: React.FC<{ venues: Venue[]; onVenueSelect: (venue: Venue) => void; userLocation: UserLocation | null; }> = ({ venues, onVenueSelect, userLocation }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Venue Hotspots Overview</h2>
      {venues.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {venues.map((venue, index) => (
            <LocationCard 
              key={venue.id} 
              venue={venue} 
              index={index} 
              isMapView={true} 
              onSelect={() => onVenueSelect(venue)}
              userLocation={userLocation}
            />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8">No venues match your current filters for the map view.</p>
      )}
       <div className="mt-8 p-4 border border-slate-700 rounded-md bg-slate-900/50">
        <h3 className="text-lg font-medium text-sky-300 mb-2">Dynamic Map Simulation</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          This view simulates dynamic map pins. Each "pin" (card) is styled by its current popularity:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-400 mt-2 space-y-1 pl-2">
            <li><span className="font-semibold text-red-400">Red (Largest):</span> Very Crowded</li>
            <li><span className="font-semibold text-orange-400">Orange:</span> Busy</li>
            <li><span className="font-semibold text-yellow-400">Yellow:</span> Moderate</li>
            <li><span className="font-semibold text-green-400">Green:</span> Light</li>
            <li><span className="font-semibold text-sky-400">Blue (Smallest):</span> Empty</li>
        </ul>
        <p className="text-sm text-slate-400 mt-3">
          A full app version would integrate an interactive map (e.g., Google Maps, Mapbox) for true geographic display, clustering, and real-time updates.
        </p>
      </div>
    </div>
  );
};
