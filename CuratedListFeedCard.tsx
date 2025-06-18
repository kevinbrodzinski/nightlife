
import React from 'react';
import type { CuratedListFeedData, Venue, CuratedListItem, UserLocation } from '../../types';
import { CompactVenueCard } from './CompactVenueCard';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';


interface CuratedListFeedCardProps {
  itemData: CuratedListFeedData;
  allVenues: Venue[];
  onSelectVenue: (venue: Venue | string) => void;
  userLocation: UserLocation | null;
}

export const CuratedListFeedCard: React.FC<CuratedListFeedCardProps> = ({ itemData, allVenues, onSelectVenue, userLocation }) => {
  const listVenues = itemData.items.map(listItem => {
    const venue = allVenues.find(v => v.id === listItem.venueId);
    return venue ? { ...venue, note: listItem.note } : null;
  }).filter(v => v !== null) as (Venue & { note?: string })[];

  if (listVenues.length === 0) {
    return <div className="p-4 bg-slate-700 rounded-lg text-slate-400">No venues found for this curated list.</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-4 md:p-5 space-y-3">
      <h3 className="text-xl font-bold text-sky-400">{itemData.title}</h3>
      {itemData.description && <p className="text-sm text-slate-400 mb-3 leading-relaxed">{itemData.description}</p>}
      
      <div className="flex overflow-x-auto space-x-3 pb-3 -mb-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        {listVenues.map((venueWithNote) => (
          <CompactVenueCard 
            key={`curated-${venueWithNote.id}`} 
            venue={venueWithNote} 
            onSelectVenue={onSelectVenue}
            note={venueWithNote.note}
            userLocation={userLocation}
          />
        ))}
      </div>
      
      {itemData.viewAllLink && (
         <div className="pt-3 text-right">
            <a 
                href={itemData.viewAllLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors group"
            >
                View All
                <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
        </div>
      )}
    </div>
  );
};
