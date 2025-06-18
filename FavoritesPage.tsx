
import React from 'react';
import type { Venue, UserLocation, SavedDayVenue } from '../types';
import { LocationCard } from './LocationCard';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CalendarDaysSolidIcon } from './icons/CalendarDaysSolidIcon';
import { BookmarkSlashIcon } from './icons/BookmarkSlashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { DAYS_OF_WEEK } from '../constants'; 

// Context Hooks
import { useFavorites } from '../contexts/FavoritesContext';
import { useVenues } from '../contexts/VenuesContext';
import { useLocation } from '../contexts/LocationContext';

interface FavoritesPageProps {
  // Props that might still come from App.tsx if they control navigation/UI elements outside this specific page's domain
  globalNotificationsEnabled: boolean; // Assuming this global setting is still managed by App for now
  onToggleGlobalNotifications: () => void; // App level for now
  onSelectVenue: (venue: Venue | string) => void; // Navigation to detail view
  onDiscover: () => void; // Navigation to home/discover
}

const DaySpecificSpotsView: React.FC<{
  onSelectVenue: (venue: Venue | string) => void; // Keep for navigation
  onDiscover: () => void;
}> = ({ onSelectVenue, onDiscover }) => {
  const { savedDayVenues, handleRemoveSavedVenueForDay } = useFavorites();
  const { initialVenues: allVenues } = useVenues(); // Use initialVenues if processedVenues is not needed here

  const groupedByDay = DAYS_OF_WEEK.reduce((acc, dayOption) => {
    const day = dayOption.value;
    const venuesForDay = savedDayVenues
      .filter(sdv => sdv.dayOfWeek === day)
      .map(sdv => {
        const venueDetail = allVenues.find(v => v.id === sdv.venueId);
        return venueDetail ? { ...venueDetail, notes: sdv.notes, dayOfWeek: sdv.dayOfWeek } : null;
      })
      .filter(v => v !== null) as (Venue & { notes?: string, dayOfWeek: string })[];
    
    if (venuesForDay.length > 0) acc[day] = venuesForDay;
    return acc;
  }, {} as Record<string, (Venue & { notes?: string, dayOfWeek: string })[]>);

  const hasAnyDaySpecificSaves = Object.keys(groupedByDay).length > 0;

  if (!hasAnyDaySpecificSaves) {
    return (
      <div className="text-center py-8 px-4 bg-slate-800/70 rounded-lg">
        <CalendarDaysSolidIcon className="mx-auto h-12 w-12 text-slate-500 mb-3" />
        <h4 className="text-xl font-semibold text-slate-300 mb-1">No Day-Specific Spots Saved Yet</h4>
        <p className="text-sm text-slate-400 mb-4">Found a place perfect for Wednesdays? Save it here!</p>
        <button onClick={onDiscover} className="inline-flex items-center px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-md shadow transition-colors">
          <SparklesIcon className="w-4 h-4 mr-2" /> Discover Venues
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {DAYS_OF_WEEK.map(dayOption => {
        const day = dayOption.value;
        const venuesForThisDay = groupedByDay[day];
        if (!venuesForThisDay || venuesForThisDay.length === 0) return null;
        return (
          <div key={day}>
            <h4 className="text-lg font-semibold text-teal-300 mb-2 border-b border-slate-700 pb-1">{day}s</h4>
            <div className="space-y-3">
              {venuesForThisDay.map(venue => (
                <div key={`${venue.id}-${day}`} className="p-3 bg-slate-700/70 rounded-lg shadow-sm hover:bg-slate-600/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h5 className="font-semibold text-sky-300 hover:text-sky-200 cursor-pointer" onClick={() => onSelectVenue(venue)}>{venue.name}</h5>
                      <p className="text-xs text-slate-400">{venue.category}</p>
                      {venue.notes && <p className="text-xs text-slate-300 italic mt-1">Notes: "{venue.notes}"</p>}
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-1.5 mt-0.5">
                       <button onClick={() => onSelectVenue(venue)} className="p-1.5 text-xs bg-sky-700 hover:bg-sky-600 text-white rounded-md" aria-label={`View details for ${venue.name}`}><EyeIcon className="w-3.5 h-3.5" /></button>
                       <button onClick={() => handleRemoveSavedVenueForDay(venue.id, day)} className="p-1.5 text-xs bg-red-700 hover:bg-red-600 text-white rounded-md" aria-label={`Remove ${venue.name} from ${day}s`}><BookmarkSlashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ 
  globalNotificationsEnabled,
  onToggleGlobalNotifications,
  onSelectVenue,
  onDiscover,
}) => {
  const { favoritedVenuesDetails, handleToggleVenueNotification } = useFavorites();
  const { effectiveLocation } = useLocation();
  const { savedDayVenues } = useFavorites(); // Get this for the condition below
  const { initialVenues } = useVenues(); // For DaySpecificSpotsView

  return (
    <div className="animate-fadeIn space-y-10">
      <div>
        <div className="mb-6 p-4 bg-slate-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-sky-400 mb-3">Favorite Venue Notifications</h2>
          <div className="flex items-center justify-between">
            <label htmlFor="globalNotifications" className="text-slate-300 flex-grow cursor-pointer">Notify me when any of my favorites get busy<p className="text-xs text-slate-500">Applies to general favorites.</p></label>
            <button id="globalNotifications" onClick={onToggleGlobalNotifications} aria-pressed={globalNotificationsEnabled} className={`p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${globalNotificationsEnabled ? 'bg-teal-600 hover:bg-teal-500 focus:ring-teal-400' : 'bg-slate-600 hover:bg-slate-500 focus:ring-slate-400'}`}>
              {globalNotificationsEnabled ? <BellIcon className="w-6 h-6 text-white" /> : <BellSlashIcon className="w-6 h-6 text-slate-300" />}
            </button>
          </div>
        </div>

        {favoritedVenuesDetails.length === 0 ? (
          <div className="text-center py-8 px-6 bg-slate-800 rounded-xl shadow-lg">
            <SparklesIcon className="mx-auto h-16 w-16 text-yellow-400 opacity-70 mb-4" />
            <h3 className="text-2xl font-semibold text-slate-300 mb-2">No General Favorites Yet</h3>
            <p className="text-slate-400">Heart a venue to add it here!</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-sky-400 mb-4 text-center sm:text-left">Your General Favorite Hotspots</h2>
            <div className="space-y-6">
              {favoritedVenuesDetails.map((venue, index) => (
                <LocationCard key={venue.id} venue={venue} index={index} onSelect={() => onSelectVenue(venue)} showNotificationToggle={true} isNotificationEnabled={venue.isNotificationEnabled} onToggleNotification={() => handleToggleVenueNotification(venue.id)} isGlobalNotificationsEnabled={globalNotificationsEnabled} userLocation={effectiveLocation} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl">
        <div className="text-center sm:text-left mb-4">
          <h2 className="text-2xl font-bold text-sky-400 mb-1 flex items-center justify-center sm:justify-start"><CalendarDaysSolidIcon className="w-7 h-7 mr-2 text-teal-400" /> My Day-Specific Hotspots</h2>
          <p className="text-sm text-slate-400">Your go-to spots for particular days.</p>
        </div>
        <DaySpecificSpotsView onSelectVenue={onSelectVenue} onDiscover={onDiscover} />
      </div>

      {favoritedVenuesDetails.length === 0 && savedDayVenues.length === 0 && (
         <div className="text-center py-12 px-6 bg-slate-800/50 rounded-xl shadow-lg mt-10">
            <SparklesIcon className="mx-auto h-16 w-16 text-yellow-400 opacity-70 mb-4" />
            <h3 className="text-2xl font-semibold text-slate-300 mb-2">Your Adventure Awaits!</h3>
            <p className="text-slate-400">Your favorites and day-specific spots lists are empty.</p>
            <p className="text-slate-400 mt-2 mb-6">Start exploring to save the best spots!</p>
            <button onClick={onDiscover} className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800">
                <SparklesIcon className="w-5 h-5 mr-2" /> Discover Hotspots
            </button>
        </div>
       )}
    </div>
  );
};
