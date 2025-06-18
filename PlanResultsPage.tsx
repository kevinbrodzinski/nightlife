import React from 'react';
import type { PlannedItineraryItem, Venue, SharedPlan, MemberPresenceStatus, UserLocation } from '../types';
import { PopularityIndicator } from './PopularityIndicator';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkSquareIcon } from './icons/BookmarkSquareIcon';
import { BookmarkIcon as BookmarkIconSolid } from './icons/BookmarkIconSolid';
import { PinIcon } from './icons/PinIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { TrashIcon } from './icons/TrashIcon'; 
import { POPULARITY_COLORS } from '../constants'; 

// Context Hooks
import { usePlanner } from '../contexts/PlannerContext';
import { useLocation } from '../contexts/LocationContext';

interface PlanResultsPageProps {
  onVenueSelect: (venue: Venue) => void; 
  onShare?: (title: string, text: string, url: string) => Promise<void>; 
}

const PresenceDisplay: React.FC<{ presence: Record<string, { status: MemberPresenceStatus, currentVenueId: string | null }>, venueId: string }> = ({ presence, venueId }) => {
    const membersAtThisVenue = Object.entries(presence).filter(([_, p]) => p.currentVenueId === venueId && p.status === 'at_venue').map(([name, _]) => name);
    const membersOnTheWay = Object.entries(presence).filter(([_, p]) => p.currentVenueId === venueId && p.status === 'on_the_way').map(([name, _]) => name);
    if (membersAtThisVenue.length === 0 && membersOnTheWay.length === 0) return <p className="text-xs text-slate-500 italic">No one here or on the way yet.</p>;
    return (
        <div className="text-xs space-y-1 mt-1">
            {membersAtThisVenue.length > 0 && (<div className="flex items-center text-green-400"><CheckBadgeIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0"/> <span className="font-medium">Here:</span>&nbsp;{membersAtThisVenue.join(', ')}</div>)}
            {membersOnTheWay.length > 0 && (<div className="flex items-center text-yellow-400"><ClockIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0"/> <span className="font-medium">On the way:</span>&nbsp;{membersOnTheWay.join(', ')}</div>)}
        </div>
    );
};

export const PlanResultsPage: React.FC<PlanResultsPageProps> = ({ 
    onVenueSelect, 
    onShare,
}) => {
  const { 
    generatedItinerary, activeSharedPlan, handleResetPlan, currentUserName,
    handleCreateSharedPlan, handleLeaveOrDeleteSharedPlan, handleUpdateMyPresence,
    copyToClipboard, handleSaveCurrentPlan, isCurrentPlanSaved
  } = usePlanner();
  const { effectiveLocation } = useLocation();

  const itineraryToDisplay = generatedItinerary || activeSharedPlan?.itinerary || [];

  if (!itineraryToDisplay || itineraryToDisplay.length === 0) {
    return (
      <div className="p-6 bg-slate-800 rounded-xl shadow-2xl animate-fadeIn text-center">
        <h1 className="text-2xl font-bold text-sky-400 mb-3">Oops!</h1>
        <p className="text-slate-400 mb-6">Something went wrong. Please try generating your plan again.</p>
        <button onClick={() => handleResetPlan()} className="flex items-center justify-center mx-auto px-6 py-3 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800">
          <ArrowPathIcon className="w-5 h-5 mr-2" /> Start Over
        </button>
      </div>
    );
  }

  const isCurrentItineraryShared = activeSharedPlan && 
                                 activeSharedPlan.itinerary.length === itineraryToDisplay.length &&
                                 activeSharedPlan.itinerary.every((item, index) => item.venue.id === itineraryToDisplay[index].venue.id);
  
  const handlePlanShare = () => {
    if (onShare) {
      const title = activeSharedPlan ? `Join My Night Plan: ${activeSharedPlan.planId}` : "My Night Out Plan";
      let text = activeSharedPlan ? `Join our group plan! Code: ${activeSharedPlan.planId}. ` : "Here's my plan for tonight: ";
      itineraryToDisplay.forEach((item, index) => { text += `[Stop ${index + 1}: ${item.activityLabel} at ${item.venue.name}]${index < itineraryToDisplay.length - 1 ? " → " : ""}`; });
      text += `! Created with Nightlife Hotspot Finder.`;
      const planIdentifier = activeSharedPlan ? activeSharedPlan.planId : itineraryToDisplay.map(item => item.venue.id.split('-')[1] || 'plan').join('-');
      const url = `https://example.com/nightlife-app/plan/${planIdentifier}`; 
      onShare(title, text, url);
    }
  };

  const currentUserPresenceForVenue = (venueId: string): MemberPresenceStatus | undefined => {
    if (!isCurrentItineraryShared || !activeSharedPlan?.memberPresence[currentUserName]) return undefined;
    const presence = activeSharedPlan.memberPresence[currentUserName];
    return presence.currentVenueId === venueId ? presence.status : undefined;
  };

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl animate-fadeIn space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-400 mb-2">{isCurrentItineraryShared && activeSharedPlan ? `Group Plan: ${activeSharedPlan.planId}` : "Your Epic Night Plan!"}</h1>
        <p className="text-slate-400">{isCurrentItineraryShared ? "Here's the group itinerary. Update your status!" : "Here's a suggested itinerary."}</p>
      </div>

      {isCurrentItineraryShared && activeSharedPlan && (
        <div className="p-4 bg-slate-700/50 rounded-lg space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-lg font-semibold text-teal-300">Share Code: <span className="bg-slate-800 px-2 py-1 rounded-md text-yellow-300 tracking-wider">{activeSharedPlan.planId}</span></p>
            <button onClick={() => copyToClipboard(activeSharedPlan.planId, `Code "${activeSharedPlan.planId}" copied!`)} className="flex items-center px-3 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition-colors"><ClipboardDocumentCheckIcon className="w-4 h-4 mr-1.5"/> Copy Code</button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-1">Group Members:</h4>
            <div className="flex flex-wrap gap-2">{activeSharedPlan.members.map(member => (<span key={member} className={`px-2.5 py-1 text-xs rounded-full font-medium ${member === currentUserName ? 'bg-sky-500 text-white' : 'bg-slate-600 text-slate-300'}`}>{member}</span>))}</div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {itineraryToDisplay.map((item, index) => (
          <div key={`${item.venue.id}-${index}`} className="relative pl-8 group">
            {index < itineraryToDisplay.length -1 && (<div className="absolute left-3 top-5 bottom-[-1.5rem] w-0.5 bg-slate-700 group-hover:bg-teal-500 transition-colors duration-300"></div>)}
            <div className={`absolute left-0 top-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ring-4 ring-slate-800 group-hover:ring-teal-500 transition-colors duration-300 ${item.venue.currentPopularity && POPULARITY_COLORS[item.venue.currentPopularity] ? POPULARITY_COLORS[item.venue.currentPopularity].split(' ')[0] : 'bg-slate-600'} text-white`}>{index + 1}</div>
            <div className="p-4 bg-slate-700/70 rounded-lg shadow-md transition-all duration-200">
              <div className="cursor-pointer hover:bg-slate-600/30 -m-4 p-4 rounded-lg" onClick={() => onVenueSelect(item.venue)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onVenueSelect(item.venue); }} aria-label={`View details for ${item.venue.name}`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                  <div>
                      <p className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Stop {index + 1}: {item.activityLabel}</p>
                      <h3 className="text-xl font-bold text-sky-300 group-hover:text-sky-200 transition-colors">{item.venue.name}</h3>
                      <p className="text-sm text-slate-400">{item.venue.category}</p>
                  </div>
                  {item.venue.currentPopularity && (<div className="mt-2 sm:mt-0"><PopularityIndicator popularity={item.venue.currentPopularity} size="small"/></div>)}
                </div>
                <div className="text-sm text-slate-300 my-2"><span className="font-semibold">Time:</span> {item.startTime} - {item.endTime}</div>
                <div className="text-xs text-slate-400 flex items-center"><PinIcon className="w-3 h-3 mr-1 text-slate-500 flex-shrink-0" />{item.venue.address}</div>
                {effectiveLocation && item.venue.distanceInMiles !== undefined && (<p className="text-xs text-slate-400 mt-1">({item.venue.distanceInMiles.toFixed(1)} mi away)</p>)}
              </div>
              {isCurrentItineraryShared && activeSharedPlan && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                    <h5 className="text-xs font-semibold text-slate-400 mb-1.5">Group Status:</h5>
                    <PresenceDisplay presence={activeSharedPlan.memberPresence} venueId={item.venue.id} />
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                        {(currentUserPresenceForVenue(item.venue.id) !== 'at_venue') && (<button onClick={() => handleUpdateMyPresence(item.venue.id, 'at_venue')} className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded"><CheckBadgeIcon className="w-3.5 h-3.5 mr-1"/> I'm Here!</button>)}
                        {(currentUserPresenceForVenue(item.venue.id) !== 'on_the_way') && (<button onClick={() => handleUpdateMyPresence(item.venue.id, 'on_the_way')} className="flex items-center px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded"><ClockIcon className="w-3.5 h-3.5 mr-1"/> On My Way</button>)}
                        {(currentUserPresenceForVenue(item.venue.id) === 'at_venue' || currentUserPresenceForVenue(item.venue.id) === 'on_the_way') && (<button onClick={() => handleUpdateMyPresence(item.venue.id, 'left_venue')} className="flex items-center px-2 py-1 bg-slate-500 hover:bg-slate-400 text-white rounded"><ArrowUturnLeftIcon className="w-3.5 h-3.5 mr-1"/> I've Left</button>)}
                    </div>
                </div>
              )}
            </div>
            {item.travelTimeToNext && (<div className="pl-0 mt-3 text-right"><p className="text-xs text-slate-500 italic animate-pulse">&darr; {item.travelTimeToNext} &darr;</p></div>)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 border-t border-slate-700">
        {!isCurrentItineraryShared && (<button onClick={handleSaveCurrentPlan} disabled={isCurrentPlanSaved} className={`flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${isCurrentPlanSaved ? 'bg-green-700 text-green-200 cursor-default' : 'bg-green-600 hover:bg-green-500 text-white focus:ring-green-400'}`}>{isCurrentPlanSaved ? <BookmarkIconSolid className="w-5 h-5 mr-2" /> : <BookmarkSquareIcon className="w-5 h-5 mr-2" />}{isCurrentPlanSaved ? 'Plan Saved' : 'Save This Plan'}</button>)}
        {!isCurrentItineraryShared && (<button onClick={handleCreateSharedPlan} className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"><UserGroupIcon className="w-5 h-5 mr-2" />Create Group Plan</button>)}
        {isCurrentItineraryShared && activeSharedPlan && (<button onClick={handleLeaveOrDeleteSharedPlan} className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800"><TrashIcon className="w-5 h-5 mr-2" />{activeSharedPlan?.creatorName === currentUserName ? 'Delete Group Plan' : 'Leave Group Plan'}</button>)}
        {onShare && (<button onClick={handlePlanShare} className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"><ShareIcon className="w-5 h-5 mr-2" />{isCurrentItineraryShared ? 'Share Group Code' : 'Share This Plan'}</button>)}
      </div>
      <button onClick={() => handleResetPlan()} className="w-full mt-3 flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800"><ArrowPathIcon className="w-5 h-5 mr-2" />{isCurrentItineraryShared ? 'Back to Planner Options' : 'Start Over / New Plan'}</button>
    </div>
  );
};