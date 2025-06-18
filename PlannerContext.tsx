import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useMemo } from 'react';
import type { CurrentPlannerView, PlannedItineraryItem, UserPlan, SharedPlan, MemberPresenceStatus, Venue, AIChatMessage } from '../types';
import { useToast } from './ToastContext';
import { useFilters } from './FiltersContext';
import { useVenues } from './VenuesContext';
import { useUser } from './UserContext'; // New: Import useUser
import { TIME_SLOTS, PLANNER_ACTIVITY_OPTIONS, MAX_PLANNER_SELECTIONS } from '../constants';
import { formatISODateForDisplay } from '../utils/date';


interface PlannerContextType {
  currentPlannerView: CurrentPlannerView;
  setCurrentPlannerView: React.Dispatch<React.SetStateAction<CurrentPlannerView>>;
  plannerActivitySelections: string[];
  setPlannerActivitySelections: React.Dispatch<React.SetStateAction<string[]>>;
  generatedItinerary: PlannedItineraryItem[] | null;
  setGeneratedItinerary: React.Dispatch<React.SetStateAction<PlannedItineraryItem[] | null>>;
  savedPlans: UserPlan[];
  activeSharedPlan: SharedPlan | null;
  userPlans: Record<string, SharedPlan>; 

  handleGenerateManualPlan: () => void;
  handleResetPlan: (options?: { resetToAIChatMessage?: AIChatMessage }) => void;
  addVenueToItinerary: (venue: Venue, activityLabel: string, aiPrompt?: string) => void;
  
  handleSaveCurrentPlan: () => void;
  handleDeleteSavedPlan: (planId: string) => void;
  handleLoadSavedPlan: (planId: string, sendAIMessageCallback: (message: string, isSystemUpdate?: boolean) => void) => void;
  isCurrentPlanSaved: boolean;
  clearAllSavedPlans: () => void;

  handleCreateSharedPlan: () => void; 
  handleJoinSharedPlan: (planIdToJoin: string) => void;
  handleLeaveOrDeleteSharedPlan: () => void;
  handleUpdateMyPresence: (venueId: string | null, status: MemberPresenceStatus) => void;
  copyToClipboard: (textToCopy: string, successMessage: string) => Promise<void>;
  currentUserName: string; // This will now come from UserContext
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { selectedDay, selectedTime } = useFilters(); // Removed defaultDay, defaultTime as they are specific to filter init
  const { processedVenues } = useVenues();
  const { currentUserNameOrDefault: userNameFromContext } = useUser(); // New: Get username from UserContext

  const currentUserName = userNameFromContext; // Use the username from context

  const [currentPlannerView, setCurrentPlannerView] = useState<CurrentPlannerView>('ai');
  const [plannerActivitySelections, setPlannerActivitySelections] = useState<string[]>([]);
  const [generatedItinerary, setGeneratedItinerary] = useState<PlannedItineraryItem[] | null>(null);
  
  const [savedPlans, setSavedPlans] = useState<UserPlan[]>(() => {
    const plansStr = localStorage.getItem('nightlifeFinderSavedPlans');
    return plansStr ? JSON.parse(plansStr) : [];
  });
   useEffect(() => {
    localStorage.setItem('nightlifeFinderSavedPlans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  const [activeSharedPlan, setActiveSharedPlan] = useState<SharedPlan | null>(null);
  const [userPlans, setUserPlans] = useState<Record<string, SharedPlan>>(() => { 
    const plansStr = localStorage.getItem('nightlifeFinderUserPlans');
    return plansStr ? JSON.parse(plansStr) : {};
  });
  useEffect(() => {
    localStorage.setItem('nightlifeFinderUserPlans', JSON.stringify(userPlans));
  }, [userPlans]);


  const formatTime = (hour: number, minute: number): string => {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const m = minute < 10 ? `0${minute}` : minute;
    const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
    return `${h}:${m} ${ampm}`;
  };

  const addVenueToItinerary = useCallback((venue: Venue, activityLabel: string, aiPrompt?: string) => {
    setGeneratedItinerary(prevItinerary => {
        const newItinerary = prevItinerary ? [...prevItinerary] : [];
        if (newItinerary.length >= MAX_PLANNER_SELECTIONS) {
            showToast(`Plan is full. Max ${MAX_PLANNER_SELECTIONS} stops.`, "error");
            return newItinerary; // Return original itinerary if full
        }
        
        let currentTime = new Date(); 
        const [year, month, day] = selectedDay.split('-').map(Number);
        currentTime.setFullYear(year, month - 1, day);

        if (newItinerary.length > 0) {
            const lastItem = newItinerary[newItinerary.length - 1];
            const timeParts = lastItem.endTime.match(/(\d+):(\d+)\s(AM|PM)/);
            if (timeParts) {
                let hours = parseInt(timeParts[1]);
                const minutes = parseInt(timeParts[2]);
                const period = timeParts[3];
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0; 
                currentTime.setHours(hours, minutes);
                currentTime.setMinutes(currentTime.getMinutes() + 30); 
            } else { 
                 currentTime.setHours(parseInt(selectedTime) + newItinerary.length, 0); 
            }
        } else {
            currentTime.setHours(parseInt(selectedTime), 0);
        }

        const activityDetails = PLANNER_ACTIVITY_OPTIONS.find(opt => opt.label === activityLabel || opt.value === activityLabel.toLowerCase().replace(' ',''));
        const activityDurationMinutes = activityDetails?.defaultDurationMinutes || 90;
        const startTime = formatTime(currentTime.getHours(), currentTime.getMinutes());
        currentTime.setMinutes(currentTime.getMinutes() + activityDurationMinutes);
        const endTime = formatTime(currentTime.getHours(), currentTime.getMinutes());
        const travelTimeToNext = "approx. 15-30 min travel";
        const newItineraryItem: PlannedItineraryItem = {
            activityType: activityDetails?.value || activityLabel.toLowerCase().replace(' ',''),
            activityLabel, venue, startTime, endTime, travelTimeToNext: undefined, aiPromptText: aiPrompt,
        };
        if (newItinerary.length > 0) newItinerary[newItinerary.length - 1].travelTimeToNext = travelTimeToNext;
        return [...newItinerary, newItineraryItem];
    });
  }, [selectedTime, selectedDay, showToast]);

  const handleGenerateManualPlan = useCallback(() => {
    if (plannerActivitySelections.length === 0) return;
    setActiveSharedPlan(null); 
    let currentTime = new Date();
    const [year, month, day] = selectedDay.split('-').map(Number);
    currentTime.setFullYear(year, month - 1, day);
    currentTime.setHours(parseInt(selectedTime), 0, 0, 0);

    const itinerary: PlannedItineraryItem[] = [];
    const usedVenueIds = new Set<string>();

    plannerActivitySelections.forEach((activityValue, index) => {
      const activityDetails = PLANNER_ACTIVITY_OPTIONS.find(opt => opt.value === activityValue);
      if (!activityDetails) return;
      const potentialVenues = processedVenues.filter(venue => {
        if (usedVenueIds.has(venue.id)) return false;
        const lowerCaseTags = venue.tags.map(t => t.toLowerCase());
        const lowerCaseCategory = venue.category.toLowerCase();
        const activitySearchTerms = [activityValue.toLowerCase(), activityDetails.label.toLowerCase(), ...activityDetails.label.toLowerCase().split(' ')];
        return activitySearchTerms.some(term => lowerCaseCategory.includes(term) || lowerCaseTags.includes(term)) || venue.category.toLowerCase().includes(activityDetails.relatedCategory?.toLowerCase() || 'impossible_match');
      }).sort((a, b) => (b.currentPopularityScore || 0) - (a.currentPopularityScore || 0));
      
      let selectedVenueForActivity = potentialVenues[0] || null;
      if (!selectedVenueForActivity && processedVenues.length > usedVenueIds.size) {
        selectedVenueForActivity = processedVenues.filter(v => !usedVenueIds.has(v.id)).sort((a, b) => (b.currentPopularityScore || 0) - (a.currentPopularityScore || 0))[0] || null;
      }
      if (!selectedVenueForActivity && processedVenues.length > 0) {
        const anyFallback = processedVenues.filter(v => !usedVenueIds.has(v.id));
        selectedVenueForActivity = anyFallback.length > 0 ? anyFallback[0] : processedVenues[index % processedVenues.length];
      }

      if (selectedVenueForActivity) {
        usedVenueIds.add(selectedVenueForActivity.id);
        const startTime = formatTime(currentTime.getHours(), currentTime.getMinutes());
        const activityDurationMinutes = activityDetails.defaultDurationMinutes || 90; 
        currentTime.setMinutes(currentTime.getMinutes() + activityDurationMinutes);
        const endTime = formatTime(currentTime.getHours(), currentTime.getMinutes());
        let travelTimeToNext: string | undefined = (index < plannerActivitySelections.length - 1) ? "approx. 15-30 min travel" : undefined;
        if (travelTimeToNext) currentTime.setMinutes(currentTime.getMinutes() + 30);
        itinerary.push({ activityType: activityValue, activityLabel: activityDetails.label, venue: selectedVenueForActivity, startTime, endTime, travelTimeToNext });
      }
    });
    setGeneratedItinerary(itinerary);
    setCurrentPlannerView('ai'); 
  }, [plannerActivitySelections, processedVenues, selectedTime, selectedDay, setCurrentPlannerView, setGeneratedItinerary, setActiveSharedPlan]);

  const handleResetPlan = useCallback((options?: { resetToAIChatMessage?: AIChatMessage }) => {
    setPlannerActivitySelections([]);
    setGeneratedItinerary(null);
    setActiveSharedPlan(null);
    setCurrentPlannerView('ai');
    // AI Chat reset is handled in AppContent/AIChatContext via `resetAIChat` call
  }, [setPlannerActivitySelections, setGeneratedItinerary, setActiveSharedPlan, setCurrentPlannerView]);

  const handleSaveCurrentPlan = useCallback(() => {
    if (!generatedItinerary || generatedItinerary.length === 0) {
      showToast("No plan to save.", "error");
      return;
    }
    const planName = `Plan for ${formatISODateForDisplay(selectedDay, 'short')} at ${TIME_SLOTS.find(t => t.value === selectedTime)?.label || selectedTime}`;
    const newPlan: UserPlan = {
      id: `plan-${Date.now()}`, name: planName, date: selectedDay, time: selectedTime,
      itinerary: generatedItinerary, createdAt: new Date().toISOString(),
    };
    setSavedPlans(prev => [...prev, newPlan]);
    showToast("Plan saved successfully!", "success");
  }, [generatedItinerary, selectedDay, selectedTime, showToast, setSavedPlans]);

  const handleDeleteSavedPlan = useCallback((planId: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== planId));
    showToast("Saved plan deleted.", "success");
  }, [showToast, setSavedPlans]);

  const clearAllSavedPlans = useCallback(() => {
    setSavedPlans([]);
    showToast("All saved plans cleared.", "success");
  }, [showToast, setSavedPlans]);

  const handleLoadSavedPlan = useCallback((planId: string, sendAIMessageCallback: (message: string, isSystemUpdate?: boolean) => void) => {
    const planToLoad = savedPlans.find(p => p.id === planId);
    if (planToLoad) {
      setGeneratedItinerary(planToLoad.itinerary);
      setCurrentPlannerView('ai'); 
      
      const timeLabel = TIME_SLOTS.find(t => t.value === planToLoad.time)?.label || planToLoad.time;
      const firstStopName = planToLoad.itinerary[0]?.venue.name || "the first stop";
      const systemMessageForAI = `System: I've loaded my saved plan for ${formatISODateForDisplay(planToLoad.date)} at ${timeLabel}. The first stop is ${firstStopName}. The full plan is now active.`;
      sendAIMessageCallback(systemMessageForAI, true);
      showToast(`Loaded plan: ${planToLoad.name}`, "success");
    } else {
      showToast("Could not load saved plan.", "error");
    }
  }, [savedPlans, showToast, setGeneratedItinerary, setCurrentPlannerView]);
  
  const isCurrentPlanSaved = useMemo(() => {
    if (!generatedItinerary) return false;
    return savedPlans.some(p => 
      p.date === selectedDay && p.time === selectedTime &&
      JSON.stringify(p.itinerary.map(i => i.venue.id)) === JSON.stringify(generatedItinerary.map(i => i.venue.id))
    );
  }, [generatedItinerary, selectedDay, selectedTime, savedPlans]);

  const generatePlanId = (): string => Math.random().toString(36).substring(2, 8).toUpperCase();

  const copyToClipboard = useCallback(async (textToCopy: string, successMessage: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        showToast(successMessage, "success");
      } else {
        showToast("Copying not supported on this browser.", "error");
      }
    } catch (error) {
      showToast("Could not copy. Please try again.", "error");
    }
  }, [showToast]);

  const handleCreateSharedPlan = useCallback(() => {
    if (!generatedItinerary) {
        showToast("Please generate a plan first.", "error");
        return;
    }
    const planId = generatePlanId();
    const newSharedPlan: SharedPlan = {
      planId, itinerary: generatedItinerary, creatorName: currentUserName,
      members: [currentUserName],
      memberPresence: { [currentUserName]: { currentVenueId: null, status: 'not_arrived' } }
    };
    setUserPlans(prev => ({ ...prev, [planId]: newSharedPlan }));
    setActiveSharedPlan(newSharedPlan);
    copyToClipboard(planId, `Group Plan created! Code "${planId}" copied.`);
  }, [generatedItinerary, currentUserName, copyToClipboard, setUserPlans, setActiveSharedPlan, showToast]);

  const handleJoinSharedPlan = useCallback((planIdToJoin: string) => {
    const planToJoin = userPlans[planIdToJoin.toUpperCase()]; 
    if (planToJoin) {
      const updatedPlan = { ...planToJoin };
      if (!updatedPlan.members.includes(currentUserName)) {
        updatedPlan.members = [...updatedPlan.members, currentUserName];
        updatedPlan.memberPresence[currentUserName] = { currentVenueId: null, status: 'not_arrived' };
      }
      const demoFriends = ["Friend Alpha", "Friend Beta"];
      demoFriends.forEach(friend => {
        if (updatedPlan.members.length < 3 && !updatedPlan.members.includes(friend)) {
            updatedPlan.members.push(friend);
            updatedPlan.memberPresence[friend] = { currentVenueId: null, status: 'not_arrived' };
        }
      });
      setUserPlans(prev => ({ ...prev, [planToJoin.planId]: updatedPlan }));
      setActiveSharedPlan(updatedPlan);
      setGeneratedItinerary(planToJoin.itinerary);
      setPlannerActivitySelections([]); 
      setCurrentPlannerView('ai'); 
      showToast(`Successfully joined plan "${planToJoin.planId}"!`, 'success');
    } else {
      showToast(`Plan code "${planIdToJoin.toUpperCase()}" not found.`, 'error');
    }
  }, [userPlans, currentUserName, showToast, setUserPlans, setActiveSharedPlan, setGeneratedItinerary, setPlannerActivitySelections, setCurrentPlannerView]);

  const handleLeaveOrDeleteSharedPlan = useCallback(() => {
    if (!activeSharedPlan) return;
    const planIdToDelete = activeSharedPlan.planId;
    
    if (activeSharedPlan.creatorName === currentUserName) {
      setUserPlans(prev => {
        const newPlans = { ...prev };
        delete newPlans[planIdToDelete];
        return newPlans;
      });
      showToast(`Group Plan "${planIdToDelete}" deleted.`, 'success');
    } else {
      const updatedMembers = activeSharedPlan.members.filter(m => m !== currentUserName);
      const updatedPresence = { ...activeSharedPlan.memberPresence };
      delete updatedPresence[currentUserName];
      if (updatedMembers.length === 0) { 
         setUserPlans(prev => {
            const newPlans = { ...prev };
            delete newPlans[planIdToDelete];
            return newPlans;
        });
         showToast(`Group Plan "${planIdToDelete}" was empty and has been removed.`, 'success');
      } else {
        setUserPlans(prev => ({
            ...prev,
            [planIdToDelete]: { ...prev[planIdToDelete], members: updatedMembers, memberPresence: updatedPresence }
        }));
        showToast(`You left Group Plan "${planIdToDelete}".`, 'success');
      }
    }
    setActiveSharedPlan(null);
    setGeneratedItinerary(null); 
  }, [activeSharedPlan, currentUserName, showToast, setUserPlans, setActiveSharedPlan, setGeneratedItinerary]);

  const handleUpdateMyPresence = useCallback((venueId: string | null, status: MemberPresenceStatus) => {
    if (!activeSharedPlan) return;
    const updatedPresence = { ...activeSharedPlan.memberPresence, [currentUserName]: { currentVenueId: venueId, status } };
    const updatedPlan: SharedPlan = { ...activeSharedPlan, memberPresence: updatedPresence };
    setActiveSharedPlan(updatedPlan);
    setUserPlans(prev => ({ ...prev, [updatedPlan.planId]: updatedPlan }));
  }, [activeSharedPlan, currentUserName, setActiveSharedPlan, setUserPlans]);

  return (
    <PlannerContext.Provider value={{
      currentPlannerView, setCurrentPlannerView,
      plannerActivitySelections, setPlannerActivitySelections,
      generatedItinerary, setGeneratedItinerary,
      savedPlans, activeSharedPlan, userPlans,
      handleGenerateManualPlan, handleResetPlan, addVenueToItinerary,
      handleSaveCurrentPlan, handleDeleteSavedPlan, handleLoadSavedPlan, isCurrentPlanSaved, clearAllSavedPlans,
      handleCreateSharedPlan, handleJoinSharedPlan, handleLeaveOrDeleteSharedPlan, handleUpdateMyPresence,
      copyToClipboard, currentUserName
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};