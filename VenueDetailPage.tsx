
import React, { useState, useEffect } from 'react'; 
import type { Venue, PopularityLevel, UserLocation, SavedDayVenue } from '../../types';
import { PopularityIndicator } from './PopularityIndicator';
import { PeakHoursChart } from './PeakHoursChart';
import { PinIcon } from './icons/PinIcon';
import { HeartIcon as HeartIconSolid } from './icons/HeartIconSolid';
import { HeartIcon as HeartIconOutline } from './icons/HeartIconOutline';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClockIcon } from './icons/ClockIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MapPinIcon } from './icons/MapPinIcon'; 
import { TicketIcon } from './icons/TicketIcon'; 
import { CameraIcon } from './icons/CameraIcon'; 
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon'; 
import { CheckCircleIcon } from './icons/CheckCircleIcon'; 
import { ShareIcon } from './icons/ShareIcon';
import { ClipboardPlusIcon } from './icons/ClipboardPlusIcon';
import { CalendarPlusIcon } from './icons/CalendarPlusIcon';
import { BookmarkSlashIcon } from './icons/BookmarkSlashIcon';
import { SaveForDayModal } from './SaveForDayModal'; 
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';
import { POPULARITY_BORDER_COLORS, TIME_SLOTS, POPULARITY_LEVEL_OPTIONS, DAYS_OF_WEEK } from '../../constants'; 
import { getDayOfWeekFromISODate } from '../../utils/date';

// Context Hooks
import { useLocation } from '../../contexts/LocationContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useFilters } from '../../contexts/FiltersContext'; // For selectedDay and selectedTime
import { useToast } from '../../contexts/ToastContext';


interface VenueDetailPageProps {
  venue: Venue;
  onBack: () => void; 
  onShare?: (title: string, text: string, url: string) => Promise<void>;
  onAddToPlan: (venue: Venue) => void; // This specific interaction might still be passed from App if it orchestrates more
}

export const VenueDetailPage: React.FC<VenueDetailPageProps> = ({ 
    venue, 
    onBack,
    onShare,
    onAddToPlan,
}) => {
  const { effectiveLocation } = useLocation();
  const { 
    isVenueFavorite, handleToggleFavorite, 
    handleSaveVenueForDay, handleRemoveSavedVenueForDay, 
    getVenueSaveDetailsForDay, getDaysVenueIsSavedFor 
  } = useFavorites();
  const { selectedDay: appSelectedDay, selectedTime } = useFilters();
  const { showToast } = useToast();


  const popularityBorder = venue.currentPopularity ? POPULARITY_BORDER_COLORS[venue.currentPopularity] : 'border-slate-700';
  const hourlyPopularityData = venue.historicalPopularity[getDayOfWeekFromISODate(appSelectedDay)] || {};

  const specialsToday = venue.id === "venue-1" ? ["Happy Hour 5-7 PM: Half-price cocktails!", "Live Jazz Trio @ 9 PM"] : [];
  const openHoursToday = "5:00 PM - 2:00 AM";
  const website = venue.id === "venue-1" ? "example.com" : null;
  const phoneNumber = venue.id === "venue-1" ? "(555) 123-4567" : null;

  const [selectedFeedbackLevel, setSelectedFeedbackLevel] = useState<PopularityLevel | null>(null);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false); 
  const [isSaveForDayModalOpen, setIsSaveForDayModalOpen] = useState<boolean>(false);
  const [isFeedbackSectionOpen, setIsFeedbackSectionOpen] = useState<boolean>(false);
  
  const [savedDaysForVenue, setSavedDaysForVenue] = useState<Array<{ day: string, notes?: string }>>([]);

  useEffect(() => {
    setSavedDaysForVenue(getDaysVenueIsSavedFor(venue.id));
  }, [venue.id, getDaysVenueIsSavedFor, isSaveForDayModalOpen]); 

  const handleSubmitFeedback = async () => {
    if (!selectedFeedbackLevel) {
      showToast("Please select a crowd level.", "error");
      return;
    }
    setIsSubmittingFeedback(true);
    console.log("Feedback Submitted:", {
      venueId: venue.id, level: selectedFeedbackLevel, comment: feedbackComment, timestamp: new Date().toISOString(),
    });
    await new Promise(resolve => setTimeout(resolve, 700)); 
    setFeedbackSubmitted(true);
    setSelectedFeedbackLevel(null);
    setFeedbackComment('');
    setIsSubmittingFeedback(false);
    setTimeout(() => setFeedbackSubmitted(false), 3000); 
  };

  const handleVenueShare = () => {
    if (onShare) {
      const shareText = `${venue.name} is currently ${venue.currentPopularity || 'a great spot'}! Check it out.`;
      const shareUrl = `https://example.com/nightlife-app/venue/${venue.id}`; // Replace with actual URL
      onShare(venue.name, shareText, shareUrl);
    }
  };
  
  const isFavoriteState = isVenueFavorite(venue.id);

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
      <div className="relative">
        <img src={`${venue.bannerImage}&detail=true`} alt={`Banner for ${venue.name}`} className="w-full h-56 sm:h-64 md:h-72 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
            <h1 className="text-3xl sm:text-4xl font-bold text-sky-300 drop-shadow-lg">{venue.name}</h1>
            <p className="text-lg text-teal-300 font-medium">{venue.category}</p>
        </div>
      </div>

      <div className={`p-4 md:p-6 border-t-4 ${popularityBorder}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {venue.currentPopularity && (
            <div className="flex-grow">
              <p className="text-sm text-slate-400 mb-1">Current Vibe ({TIME_SLOTS.find(ts => ts.value === selectedTime)?.label || 'Selected Time'})</p>
              <PopularityIndicator popularity={venue.currentPopularity} />
            </div>
          )}
           <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:items-start lg:items-center md:justify-start">
            <button onClick={() => onAddToPlan(venue)} aria-label="Add to plan" className="w-full sm:w-auto md:w-full lg:w-auto flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-800">
                <ClipboardPlusIcon className="w-5 h-5" />
                <span>Add to Plan</span>
            </button>
            <button onClick={() => handleToggleFavorite(venue.id)} aria-label={isFavoriteState ? "Remove from favorites" : "Add to favorites"} aria-pressed={isFavoriteState} className="w-full sm:w-auto md:w-full lg:w-auto flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-800">
                {isFavoriteState ? <HeartIconSolid className="w-5 h-5" /> : <HeartIconOutline className="w-5 h-5" />}
                <span>{isFavoriteState ? "Favorited" : "Favorite"}</span>
            </button>
          </div>
        </div>
        {isFavoriteState && <p className="text-xs text-slate-400 mt-[-1.25rem] mb-4 text-left sm:ml-2">Notifications managed in Favorites tab.</p>}

        <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-md font-semibold text-slate-200 mb-2 flex items-center">
            <CalendarPlusIcon className="w-5 h-5 mr-2 text-teal-400" /> Save for Specific Day(s)
          </h3>
          {savedDaysForVenue.length > 0 && (
            <div className="mb-3 space-y-1.5">
              <p className="text-xs text-slate-400">Saved for:</p>
              {savedDaysForVenue.map(savedDay => (
                <div key={savedDay.day} className="flex justify-between items-center p-2 bg-slate-600/50 rounded text-xs">
                  <div>
                    <span className="font-semibold text-teal-300">{savedDay.day}:</span>
                    <span className="text-slate-300 ml-1 italic truncate">{savedDay.notes || "No notes"}</span>
                  </div>
                  <button onClick={() => handleRemoveSavedVenueForDay(venue.id, savedDay.day)} className="p-1 text-red-400 hover:text-red-300" aria-label={`Remove save for ${savedDay.day}`}>
                    <BookmarkSlashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setIsSaveForDayModalOpen(true)} className="w-full flex items-center justify-center px-4 py-2.5 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-700/30">
            <CalendarPlusIcon className="w-4 h-4 mr-2" />
            {savedDaysForVenue.length > 0 ? "Manage Day Saves / Add Another" : "Save for a Day of the Week"}
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-md font-semibold text-slate-200 mb-3">Peak Hours for {getDayOfWeekFromISODate(appSelectedDay)}</h3>
            <PeakHoursChart hourlyPopularity={hourlyPopularityData} currentTime={selectedTime} />
        </div>
        
        {/* ... rest of the component ... */}
        {(specialsToday && specialsToday.length > 0) && (
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                <h3 className="text-md font-semibold text-slate-200 mb-2 flex items-center"><CalendarDaysIcon className="w-5 h-5 mr-2 text-teal-400" />Tonight's Specials / Events</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">{specialsToday.map((special, index) => <li key={index}>{special}</li>)}</ul>
            </div>
        )}
         {(!specialsToday || specialsToday.length === 0) && (
             <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                <h3 className="text-md font-semibold text-slate-200 mb-2 flex items-center"><CalendarDaysIcon className="w-5 h-5 mr-2 text-teal-400" />Tonight's Specials / Events</h3>
                <p className="text-sm text-slate-400">No specific specials or events listed for tonight. Call ahead for the latest!</p>
            </div>
         )}

        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-md font-semibold text-slate-200 mb-3">Venue Information</h3>
            <div className="space-y-3 text-slate-300">
                <p className="flex items-start"><PinIcon className="w-5 h-5 mr-3 mt-1 text-slate-400 flex-shrink-0" /><span>{venue.address}</span></p>
                {effectiveLocation && venue.distanceInMiles !== undefined && (<p className="flex items-start"><MapPinIcon className="w-5 h-5 mr-3 mt-1 text-slate-400 flex-shrink-0" /> <span>{venue.distanceInMiles.toFixed(1)} mi away</span></p>)}
                <p className="flex items-center"><ClockIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" /><span>Open Hours (Today): {openHoursToday || <span className="italic text-slate-500">Not Available</span>}</span></p>
                {website && (<p className="flex items-center"><GlobeAltIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" /><a href={`http://${website}`} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">{website}</a></p>)}
                {phoneNumber && (<p className="flex items-center"><PhoneIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" /><a href={`tel:${phoneNumber}`} className="text-teal-400 hover:text-teal-300">{phoneNumber}</a></p>)}
            </div>
        </div>
        <p className="leading-relaxed text-slate-300 mb-6">{venue.description}</p>
        {venue.tags && venue.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-slate-400 uppercase font-semibold mb-2">Vibe & Features</h3>
            <div className="flex flex-wrap gap-2">{venue.tags.map(tag => (<span key={tag} className="px-3 py-1.5 text-sm bg-slate-700 text-teal-300 rounded-full font-medium">{tag}</span>))}</div>
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-slate-700 space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
            <button className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"><MapPinIcon className="w-5 h-5 mr-2"/>Get Directions (Soon)</button>
            <button className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"><TicketIcon className="w-5 h-5 mr-2"/>Get a Ride (Soon)</button>
            {onShare && (<button onClick={handleVenueShare} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800"><ShareIcon className="w-5 h-5 mr-2"/>Share Venue</button>)}
        </div>
        <div className="mt-10 pt-8 border-t border-slate-700">
          <button onClick={() => setIsFeedbackSectionOpen(!isFeedbackSectionOpen)} className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600/70 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800" aria-expanded={isFeedbackSectionOpen} aria-controls="feedback-form-section">
            <span className="flex items-center text-lg font-semibold text-sky-300"><ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 mr-2 text-sky-400" />How's the Vibe Right Now? (Share Feedback)</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isFeedbackSectionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isFeedbackSectionOpen && (
            <div id="feedback-form-section" className="mt-4 p-4 bg-slate-700/30 rounded-lg animate-fadeIn">
              {feedbackSubmitted ? (
                <div className="p-4 bg-green-600/20 text-green-300 rounded-lg flex items-center space-x-3"><CheckCircleIcon className="w-6 h-6 text-green-400" /><p className="font-medium">Thanks for your input! Your feedback helps everyone.</p></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Select current crowd level:</p>
                    <div className="flex flex-wrap gap-2">{POPULARITY_LEVEL_OPTIONS.map(opt => (<button key={opt.value} onClick={() => setSelectedFeedbackLevel(opt.value)} className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700/30 ${selectedFeedbackLevel === opt.value ? 'bg-teal-500 text-white shadow-md focus:ring-teal-400' : 'bg-slate-600 text-slate-300 hover:bg-slate-500 focus:ring-teal-500'}`}>{opt.label}</button>))}</div>
                  </div>
                  <div><label htmlFor="feedbackComment" className="block text-sm text-slate-400 mb-1">Add a comment (optional):</label><textarea id="feedbackComment" value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} rows={3} placeholder="e.g., Great music, long line for drinks..." className="block w-full p-3 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out" /></div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => console.log("Photo upload clicked - placeholder")} className="flex-grow sm:flex-grow-0 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-700/30"><CameraIcon className="w-5 h-5 mr-2 text-slate-400" />Upload Photo (Soon)</button>
                    <button onClick={handleSubmitFeedback} disabled={!selectedFeedbackLevel || isSubmittingFeedback} className="flex-grow flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-700/30 disabled:opacity-60 disabled:cursor-not-allowed"><PaperAirplaneIcon className="w-5 h-5 mr-2 transform -rotate-45" />{isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-8">Latitude: {venue.latitude.toFixed(4)}, Longitude: {venue.longitude.toFixed(4)}</p>
      </div>
      {isSaveForDayModalOpen && (<SaveForDayModal isOpen={isSaveForDayModalOpen} onClose={() => setIsSaveForDayModalOpen(false)} venueId={venue.id} venueName={venue.name} daysOfWeekOptions={DAYS_OF_WEEK} onSaveVenueForDay={handleSaveVenueForDay} getVenueSaveDetailsForDay={(dayOfWeek: string) => getVenueSaveDetailsForDay(venue.id, dayOfWeek)} />)}
    </div>
  );
};
