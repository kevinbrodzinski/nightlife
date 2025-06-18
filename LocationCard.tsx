
import React from 'react';
import type { Venue, UserLocation } from '../types';
import { PopularityIndicator } from './PopularityIndicator';
import { POPULARITY_BORDER_COLORS, MAP_PIN_STYLES } from '../constants';
import { PinIcon } from './icons/PinIcon';
import { MapPinSolidIcon } from './icons/MapPinSolidIcon';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';

interface LocationCardProps {
  venue: Venue;
  index: number;
  isMapView?: boolean;
  onSelect?: () => void;
  showNotificationToggle?: boolean;
  isNotificationEnabled?: boolean;
  onToggleNotification?: () => void;
  isGlobalNotificationsEnabled?: boolean; // To correctly display effective notification status
  userLocation: UserLocation | null; // Added, will be used in Step 5 for distance display
}

export const LocationCard: React.FC<LocationCardProps> = ({ 
  venue, 
  index, 
  isMapView = false, 
  onSelect,
  showNotificationToggle = false,
  isNotificationEnabled = false,
  onToggleNotification,
  isGlobalNotificationsEnabled = true, // Assume true if not provided, for contexts outside favorites
  userLocation // New prop
}) => {
  const clickableProps = onSelect ? { onClick: onSelect, role: 'button', tabIndex: 0, onKeyDown: (e:React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onSelect()} } : {};

  const featuredTag = venue.tags && venue.tags.length > 0 ? venue.tags[0] : null;
  const otherTags = venue.tags && venue.tags.length > 1 ? venue.tags.slice(1) : [];

  if (isMapView) { 
    const pinStyle = venue.currentPopularity ? MAP_PIN_STYLES[venue.currentPopularity] : MAP_PIN_STYLES.Empty;
    return (
      <div 
        className={`rounded-lg shadow-md p-3 flex flex-col items-center justify-center text-center transition-all duration-300 ease-in-out transform hover:shadow-xl ${pinStyle.bgColor} ${pinStyle.scaleClass} ${onSelect ? 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-800 hover:ring-sky-300' : ''}`}
        style={{ aspectRatio: '1 / 1' }}
        {...clickableProps}
        aria-label={`View details for ${venue.name}`}
      >
        <MapPinSolidIcon className={`w-8 h-8 sm:w-10 sm:h-10 mb-1.5 ${pinStyle.iconColor}`} />
        <h3 className={`text-sm sm:text-md font-semibold truncate ${pinStyle.textColor}`}>{venue.name}</h3>
        <p className={`text-xs truncate ${pinStyle.textColor} opacity-80`}>{pinStyle.label}</p>
         {/* Placeholder for distance on map pins - might be too cluttered, TBD
          {userLocation && venue.distanceInMiles !== undefined && (
            <p className={`text-xxs truncate ${pinStyle.textColor} opacity-70`}>{venue.distanceInMiles.toFixed(1)} mi</p>
          )} 
        */}
      </div>
    );
  }

  const popularityBorder = venue.currentPopularity ? POPULARITY_BORDER_COLORS[venue.currentPopularity] : 'border-slate-700';
  const cardClasses = `bg-slate-800 rounded-lg shadow-lg border-l-4 ${popularityBorder} hover:shadow-xl transition-all duration-200 ease-in-out`;
  
  // Effective notification status for display
  const effectiveNotificationEnabled = isGlobalNotificationsEnabled && isNotificationEnabled;

  return (
    <article 
      className={`${cardClasses} overflow-hidden flex flex-col md:flex-row ${onSelect ? 'cursor-pointer' : ''}`}
      {...clickableProps} // Apply clickable props to the entire article
      aria-label={`View details for ${venue.name}`}
    >
      <div className="md:w-1/3 h-48 md:h-auto relative">
        <img 
          src={`${venue.bannerImage}&index=${index}`} 
          alt={`Banner for ${venue.name}`} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-slate-900 bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
          #{index + 1}
        </div>
      </div>
      <div className="p-5 md:p-6 flex-1">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
          <h2 
            className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors"
            // If onSelect is not provided, the h2 itself shouldn't have interactive role/tabIndex
            {...(onSelect ? {} : {onClick: undefined, role: undefined, tabIndex: undefined, onKeyDown: undefined})}
          >
            {venue.name}
          </h2>
          <div className="flex items-center mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 space-x-3">
            {venue.currentPopularity && (
               <PopularityIndicator popularity={venue.currentPopularity} />
            )}
            {showNotificationToggle && onToggleNotification && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleNotification(); }} // Prevent card click
                aria-label={effectiveNotificationEnabled ? "Disable notifications for this venue" : "Enable notifications for this venue"}
                aria-pressed={effectiveNotificationEnabled}
                className={`p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  effectiveNotificationEnabled ? 'bg-teal-600 hover:bg-teal-500 focus:ring-teal-400' : 'bg-slate-600 hover:bg-slate-500 focus:ring-slate-400'
                } ${!isGlobalNotificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!isGlobalNotificationsEnabled ? "Global notifications are disabled" : (effectiveNotificationEnabled ? "Disable notifications" : "Enable notifications")}
                disabled={!isGlobalNotificationsEnabled}
              >
                {effectiveNotificationEnabled ? <BellIcon className="w-5 h-5 text-white" /> : <BellSlashIcon className="w-5 h-5 text-slate-300" />}
              </button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-slate-400 mb-1 flex items-center">
          <PinIcon className="w-4 h-4 mr-1.5 text-slate-500 flex-shrink-0" />
          {venue.address}
        </div>
        <p className="text-sm text-teal-400 font-medium mb-1">{venue.category}</p>
        {/* Distance display will be updated in Step 5 */}
        <p className="text-xs text-slate-500 mb-3" id={`venue-distance-${venue.id}`}>
          {userLocation && venue.distanceInMiles !== undefined 
            ? `${venue.distanceInMiles.toFixed(1)} mi away`
            : (userLocation ? 'Calculating distance...' : 'Distance: N/A (Location permission needed)')
          }
        </p>
        
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">{venue.description}</p>
        
        {featuredTag && (
          <div className="mb-4">
            <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1.5">Featured Vibe</h4>
            <span className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-full font-semibold shadow">
              {featuredTag}
            </span>
          </div>
        )}
        
        {otherTags.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">More Tags</h4>
            <div className="flex flex-wrap gap-2">
              {otherTags.map(tag => (
                <span key={tag} className="px-2.5 py-1 text-xs bg-slate-700 text-teal-300 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
         <p className="text-xs text-slate-500 mt-3">Lat: {venue.latitude.toFixed(4)}, Lon: {venue.longitude.toFixed(4)}</p>
      </div>
    </article>
  );
};
