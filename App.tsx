
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Context Providers
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LocationProvider, useLocation } from './contexts/LocationContext';
import { FiltersProvider, useFilters } from './contexts/FiltersContext';
import { VenuesProvider, useVenues } from './contexts/VenuesContext';
import { FavoritesProvider, useFavorites } from './contexts/FavoritesContext';
import { PlannerProvider, usePlanner } from './contexts/PlannerContext';
import { AIChatProvider, useAIChat } from './contexts/AIChatContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { FriendsProvider } from './contexts/FriendsContext'; // New: FriendsProvider

// Components
import { Header } from './components/Header';
import { FilterControls } from './components/FilterControls';
import { ResultsView } from './components/ResultsView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NoResults } from './components/NoResults';
import { VenueDetailPage } from './components/VenueDetailPage';
import { FavoritesPage } from './components/FavoritesPage';
import { TrendingSpotsCarousel } from './components/TrendingSpotsCarousel';
import { FilterModal } from './components/FilterModal';
import { BottomNavigationBar } from './components/BottomNavigationBar';
import { SettingsPage } from './components/SettingsPage';
import { OfflineNotice } from './components/OfflineNotice';
import { ManualPlannerPage } from './components/ManualPlannerPage';
import { PlanResultsPage } from './components/PlanResultsPage';
import { ContentFeedPage } from './components/ContentFeedPage';
import { AIChatPlannerPage } from './components/AIChatPlannerPage';
import { SavedPlansListPage } from './components/SavedPlansListPage';
import { WelcomeBanner } from './components/WelcomeBanner';
import { FriendsPage } from './components/FriendsPage'; // New: FriendsPage
import { LightningBoltIcon } from './components/icons/LightningBoltIcon';
import ErrorBoundary from './components/ErrorBoundary'; 


import type { UserLocation, Venue, ActiveBNBTab, AppOverlay, CurrentPlannerView, PlannedItineraryItem, AIChatMessage } from './types';
import { PLANNER_ACTIVITY_OPTIONS, MAX_PLANNER_SELECTIONS } from './constants';
import { PopularityLevel as PopularityLevelEnum } from './types';
import { formatISODateForAIPrompt, formatISODateForDisplay } from './utils/date';

const APP_TITLE = "Nightlife Hotspot Finder";

// Main App content component that consumes contexts
const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const { effectiveLocation, locationPermissionDenied } = useLocation();
  const { 
    selectedDay, selectedTime, activityQuery, setActivityQuery, 
    activeAdvancedFilterCount, defaultDay, defaultTime, setSelectedDay, setSelectedTime,
    setSelectedVenueTypes, setSelectedVibes, setSelectedFeatures, setSelectedCrowdLevels, setSelectedDistance
  } = useFilters();
  const { 
    isLoadingVenues, venueError, filteredVenues, topVenuesForList, 
    trendingVenuesData, feedItems, processedVenues, initialVenues 
  } = useVenues();
  const { 
    favoriteVenueSettings, 
  } = useFavorites();
  const {
    currentPlannerView, setCurrentPlannerView, plannerActivitySelections, setPlannerActivitySelections,
    generatedItinerary,
    savedPlans, handleLoadSavedPlan, 
    activeSharedPlan, copyToClipboard,
    addVenueToItinerary, 
    handleResetPlan 
  } = usePlanner();
  const { 
    aiChatMessages, 
    handleSendAIChatMessage: originalHandleSendAIChatMessage,
    resetAIChat, addSystemMessageToAIChat
   } = useAIChat();
   // const { currentUserProfile } = useUser(); // Access user profile if needed directly in AppContent
  
  // Navigation and UI State (kept in App.tsx for now)
  const [activeBNBTab, setActiveBNBTab] = useState<ActiveBNBTab>('home');
  const [currentOverlay, setCurrentOverlay] = useState<AppOverlay>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [currentListMapView, setCurrentListMapView] = useState<'list' | 'map'>('list');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [globalBusyNotificationsEnabled, setGlobalBusyNotificationsEnabled] = useState<boolean>(() => {
    const savedGlobalPref = localStorage.getItem('nightlifeFinderGlobalNotificationPref');
    return savedGlobalPref ? JSON.parse(savedGlobalPref) : true;
  });
   const [showHomeWelcomeBanner, setShowHomeWelcomeBanner] = useState<boolean>(() => {
    const savedShowWelcome = localStorage.getItem('nightlifeFinderShowHomeWelcome');
    return savedShowWelcome ? JSON.parse(savedShowWelcome) : true;
  });

  useEffect(() => {
    localStorage.setItem('nightlifeFinderGlobalNotificationPref', JSON.stringify(globalBusyNotificationsEnabled));
  }, [globalBusyNotificationsEnabled]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Combined handleSendAIChatMessage that planner context can use
  const handleSendAIChatMessageForPlanner = useCallback((message: string, isSystemUpdate: boolean = true) => {
    originalHandleSendAIChatMessage(message, isSystemUpdate);
  },[originalHandleSendAIChatMessage]);

  const handleSelectVenue = useCallback((venue: Venue | string) => {
    let venueObj: Venue | undefined;
    if (typeof venue === 'string') {
      venueObj = processedVenues.find(v => v.id === venue);
    } else {
      venueObj = venue;
    }
    if (venueObj) {
      setSelectedVenue(venueObj);
      setCurrentOverlay('venueDetail');
    } else {
      console.warn(`Venue with ID or object not found.`);
    }
  }, [processedVenues]);

  const handleBackNavigation = useCallback(() => {
    if (currentOverlay === 'venueDetail') {
      setSelectedVenue(null);
      setCurrentOverlay(null);
    } else if (currentOverlay === 'settings') {
      setCurrentOverlay(null);
    }
  }, [currentOverlay]);

  const navigateToSettings = useCallback(() => {
    setSelectedVenue(null);
    setCurrentOverlay('settings');
  }, []);

  const navigateToPlannerView = useCallback((view: CurrentPlannerView) => {
    setCurrentPlannerView(view);
    setActiveBNBTab('planner');
    setCurrentOverlay(null);
  }, [setCurrentPlannerView, setActiveBNBTab]);

  const handleToggleGlobalNotifications = useCallback(() => {
    setGlobalBusyNotificationsEnabled(prev => !prev);
  }, []);

  const handleHotspotsNearMeNow = useCallback(() => {
    if (!effectiveLocation) {
      showToast("Enable location or set manual focus for 'Hotspots Near Me' feature.", "error");
      return;
    }
    const today = defaultDay();
    const nowTime = defaultTime();
    
    setSelectedDay(today);
    setSelectedTime(nowTime);
    setActivityQuery('');
    setSelectedVenueTypes([]);
    setSelectedVibes([]);
    setSelectedFeatures([]);
    setSelectedCrowdLevels([PopularityLevelEnum.BUSY, PopularityLevelEnum.VERY_CROWDED]);
    setSelectedDistance("1");
    
    showToast("Showing hotspots near you right now!", "success");
    setActiveBNBTab('home');
    setCurrentOverlay(null);
    
    handleSendAIChatMessageForPlanner(`System: User activated "Hotspots Near Me Now". Plan context is now for ${formatISODateForAIPrompt(today)} around ${nowTime}. Let's find some busy places within 1 mile.`, true);

  }, [effectiveLocation, showToast, defaultDay, defaultTime, handleSendAIChatMessageForPlanner, formatISODateForAIPrompt, setSelectedDay, setSelectedTime, setActivityQuery, setSelectedVenueTypes, setSelectedVibes, setSelectedFeatures, setSelectedCrowdLevels, setSelectedDistance, setActiveBNBTab, setCurrentOverlay]);


  const handleAddToPlanFromDetail = useCallback((venue: Venue) => {
    if (currentPlannerView === 'manual' || (currentPlannerView === 'ai' && !generatedItinerary) ) {
        if (plannerActivitySelections.length >= MAX_PLANNER_SELECTIONS) {
            showToast(`Manual plan is full. Max ${MAX_PLANNER_SELECTIONS} activities.`, "error");
            return;
        }
        const venueCategoryLower = venue.category.toLowerCase();
        let activityToAdd = PLANNER_ACTIVITY_OPTIONS.find(opt => 
            venueCategoryLower.includes(opt.value.toLowerCase()) || 
            venueCategoryLower.includes(opt.label.toLowerCase()) ||
            (opt.relatedCategory && venueCategoryLower.includes(opt.relatedCategory.toLowerCase()))
        );
        if (!activityToAdd) {
            activityToAdd = PLANNER_ACTIVITY_OPTIONS.find(opt => opt.value === 'chill bar') || PLANNER_ACTIVITY_OPTIONS[0];
        }
        if (activityToAdd) {
            setPlannerActivitySelections(prev => [...prev, activityToAdd!.value]);
            showToast(`${venue.name} (as ${activityToAdd.label}) added to your manual plan! Select more or generate.`, "success");
            setCurrentPlannerView('manual');
        } else {
            showToast("Could not determine an activity type for this venue.", "error");
        }
    } else { 
        if (generatedItinerary && generatedItinerary.length >= MAX_PLANNER_SELECTIONS) {
             showToast(`AI plan is full. Max ${MAX_PLANNER_SELECTIONS} activities.`, "error");
             return;
        }
        // const activityLabel = venue.category || "Visit"; 
        const systemUpdateForAI = `System: User wants to add ${venue.name} (category: ${venue.category}) directly to the plan for ${formatISODateForAIPrompt(selectedDay)}. Current itinerary length is ${generatedItinerary ? generatedItinerary.length : 0}. Confirm this addition or ask what's next if plan is not full.`;
        handleSendAIChatMessageForPlanner(systemUpdateForAI, true);
        showToast(`${venue.name} requested to be added to your AI-assisted plan!`, "success");
        setCurrentPlannerView('ai'); 
    }
    setActiveBNBTab('planner');
    setCurrentOverlay(null); 
  }, [currentPlannerView, plannerActivitySelections, showToast, generatedItinerary, handleSendAIChatMessageForPlanner, selectedDay, formatISODateForAIPrompt, setPlannerActivitySelections, setCurrentPlannerView, setActiveBNBTab, setCurrentOverlay]);

  const handleAIAddVenueToPlan = useCallback((venue: Venue, fromAiPrompt: string) => {
    if (generatedItinerary && generatedItinerary.length >= MAX_PLANNER_SELECTIONS) {
      showToast(`Plan is full. Max ${MAX_PLANNER_SELECTIONS} activities.`, "error");
       addSystemMessageToAIChat(`Your plan has ${MAX_PLANNER_SELECTIONS} stops, which is the maximum. Shall we view the plan now?`, 'show_plan');
      return;
    }
    const activityLabel = venue.category; 
    addVenueToItinerary(venue, activityLabel, fromAiPrompt); 
    showToast(`${venue.name} added to your plan!`, "success");
    
    const confirmationToAI = `System: User added ${venue.name} (category: ${venue.category}) to the plan for ${formatISODateForAIPrompt(selectedDay)}. This was based on AI suggestion related to: "${fromAiPrompt}". My current itinerary length is ${generatedItinerary ? generatedItinerary.length + 1 : 1}. What's next?`;
    handleSendAIChatMessageForPlanner(confirmationToAI, true);

  }, [showToast, handleSendAIChatMessageForPlanner, generatedItinerary, selectedDay, formatISODateForAIPrompt, addSystemMessageToAIChat, addVenueToItinerary]); 
  
  const localHandleResetPlan = useCallback(() => {
    handleResetPlan(); 
    const currentDefaultDay = defaultDay();
    resetAIChat(`Hi! I'm Nova, your personal nightlife concierge for ${formatISODateForDisplay(currentDefaultDay, 'short')}. What are you in the mood for tonight?`);
    
    setSelectedDay(currentDefaultDay);
    setSelectedTime(defaultTime());

  }, [handleResetPlan, resetAIChat, defaultDay, defaultTime, setSelectedDay, setSelectedTime, formatISODateForDisplay]);

   const localHandleLoadSavedPlan = useCallback((planId: string) => {
        const planToLoad = savedPlans.find(p => p.id === planId);
        if (planToLoad) {
            setSelectedDay(planToLoad.date);
            setSelectedTime(planToLoad.time);
            handleLoadSavedPlan(planId, handleSendAIChatMessageForPlanner); // Pass the callback
            setActiveBNBTab('planner');
            setCurrentOverlay(null);
        }
    }, [savedPlans, handleLoadSavedPlan, handleSendAIChatMessageForPlanner, setSelectedDay, setSelectedTime, setActiveBNBTab, setCurrentOverlay]);


  useEffect(() => {
    setCurrentOverlay(null);
    setSelectedVenue(null);
    if (activeBNBTab === 'map') {
      setCurrentListMapView('map');
    }
  }, [activeBNBTab]);

  const handleDismissHomeWelcomeBanner = useCallback(() => {
    setShowHomeWelcomeBanner(false);
    localStorage.setItem('nightlifeFinderShowHomeWelcome', JSON.stringify(false));
  }, []);


  const renderBNBPageContent = () => {
    switch (activeBNBTab) {
      case 'home':
      case 'map':
        const viewModeForTab = activeBNBTab === 'map' ? 'map' : currentListMapView;
        return (
          <>
            {activeBNBTab === 'home' && showHomeWelcomeBanner && (
              <WelcomeBanner onDismiss={handleDismissHomeWelcomeBanner} />
            )}
            {activeBNBTab === 'home' && (
               <button
                onClick={handleHotspotsNearMeNow}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out mb-6 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Find hotspots near me now"
              >
                <LightningBoltIcon className="w-6 h-6" />
                <span>Hotspots Near Me Now</span>
              </button>
            )}
            <FilterControls
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              disableViewToggle={activeBNBTab === 'map'}
              currentView={viewModeForTab}
              setCurrentView={setCurrentListMapView}
            />
            {trendingVenuesData.venues.length > 0 && (
              <TrendingSpotsCarousel
                onVenueSelect={handleSelectVenue}
              />
            )}
            {isLoadingVenues && filteredVenues.length === 0 ? (
              <ResultsView
                view={viewModeForTab}
                onVenueSelect={handleSelectVenue}
                isLoading={true}
              />
            ) : filteredVenues.length > 0 ? (
              <ResultsView
                view={viewModeForTab}
                onVenueSelect={handleSelectVenue}
                isLoading={isLoadingVenues}
              />
            ) : (
              <NoResults onOpenFilterModal={() => setIsFilterModalOpen(true)} />
            )}
          </>
        );
      case 'favorites':
        return (
          <FavoritesPage
            onSelectVenue={handleSelectVenue}
            globalNotificationsEnabled={globalBusyNotificationsEnabled}
            onToggleGlobalNotifications={handleToggleGlobalNotifications}
            onDiscover={() => setActiveBNBTab('home')}
          />
        );
      case 'planner':
        if (generatedItinerary || activeSharedPlan) {
          return (
            <PlanResultsPage
              onVenueSelect={handleSelectVenue}
              onShare={(title, text, url) => copyToClipboard(url, "Plan link copied!")} 
            />
          );
        }
        switch (currentPlannerView) {
          case 'ai':
            return (
              <AIChatPlannerPage
                onSwitchToManual={() => navigateToPlannerView('manual')}
                onLoadSavedPlans={() => navigateToPlannerView('savedList')}
                onAddVenueToPlan={handleAIAddVenueToPlan} 
                onViewPlan={() => { /* App logic will show PlanResultsPage if itinerary exists */ }}
                onSelectVenue={handleSelectVenue}
                maxPlannerSelections={MAX_PLANNER_SELECTIONS}
              />
            );
          case 'manual':
            return (
              <ManualPlannerPage
                onSwitchToAI={() => navigateToPlannerView('ai')}
                onLoadSavedPlans={() => navigateToPlannerView('savedList')}
              />
            );
          case 'savedList':
            return (
              <SavedPlansListPage
                onLoadPlan={localHandleLoadSavedPlan} 
                onBack={() => navigateToPlannerView('ai')}
              />
            );
          default: return null;
        }
      case 'feed':
        return (
          <ContentFeedPage
            onSelectVenue={handleSelectVenue}
            onShare={(title, text, url) => copyToClipboard(url, "Feed item link copied!")}
          />
        );
      case 'friends': // New case for Friends tab
        return <FriendsPage />;
      default:
        return null;
    }
  };

  const renderOverlayContent = () => {
    if (currentOverlay === 'venueDetail' && selectedVenue) {
      return (
        <VenueDetailPage
          venue={selectedVenue}
          onBack={handleBackNavigation}
          onShare={(title, text, url) => copyToClipboard(url, "Venue link copied!")}
          onAddToPlan={handleAddToPlanFromDetail}
        />
      );
    }
    if (currentOverlay === 'settings') {
      return (
        <SettingsPage
          globalNotificationsEnabled={globalBusyNotificationsEnabled}
          onToggleGlobalNotifications={handleToggleGlobalNotifications}
        />
      );
    }
    return null;
  };

  let pageTitleForHeader: string | undefined = undefined;
  if (currentOverlay === 'venueDetail' && selectedVenue) {
    pageTitleForHeader = selectedVenue.name;
  } else if (currentOverlay === 'settings') {
    pageTitleForHeader = "Settings";
  }


  if (!isOnline) return <OfflineNotice />;

  if (!process.env.API_KEY) {
    return (
     <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header appTitle={APP_TITLE} currentOverlay={currentOverlay} pageTitle={pageTitleForHeader} onBackClick={handleBackNavigation} onSettingsClick={navigateToSettings} />
       <div className="w-full max-w-4xl mx-auto p-4 pb-24 flex-grow flex items-center justify-center">
          <div className="p-6 bg-slate-800 rounded-xl shadow-lg text-center">
           <h2 className="text-2xl font-semibold text-red-400 mb-3">Core Feature Disabled</h2>
           <p className="text-slate-300">This application requires an API key for its core functionality.</p>
           <p className="text-slate-400 mt-2">Please ensure the <code className="bg-slate-700 px-1 rounded">API_KEY</code> environment variable is correctly set and refresh the application.</p>
            {activeBNBTab === 'planner' && currentPlannerView === 'ai' && (
                <button onClick={() => navigateToPlannerView('manual')} className="mt-6 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg">
                   Use Manual Planner Instead
               </button>
            )}
         </div>
       </div>
       <BottomNavigationBar activeBNBTab={activeBNBTab} setActiveBNBTab={setActiveBNBTab} favoriteCount={favoriteVenueSettings.length} />
     </div>
   );
 }
  
  if (isLoadingVenues && initialVenues.length === 0 && !venueError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <LoadingSpinner />
        <p className="text-slate-300 mt-4 text-lg">Summoning the city's vibes...</p>
      </div>
    );
  }

  if (venueError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header appTitle={APP_TITLE} currentOverlay={currentOverlay} pageTitle={pageTitleForHeader} onBackClick={handleBackNavigation} onSettingsClick={navigateToSettings} />
        <div className="flex-grow flex items-center justify-center p-4 text-center">
            <div>
                <p className="text-red-400 text-xl">Error loading venue data:</p>
                <p className="text-slate-300 mt-2 bg-slate-800 p-4 rounded-md">{venueError}</p>
                <p className="text-slate-400 mt-4">This might be due to an issue with the AI service or network. Please try refreshing the page.</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center selection:bg-teal-500 selection:text-white">
      <Header appTitle={APP_TITLE} currentOverlay={currentOverlay} pageTitle={pageTitleForHeader} onBackClick={handleBackNavigation} onSettingsClick={navigateToSettings} />
      <div className="w-full max-w-4xl mx-auto p-4 pb-24 flex-grow">
        {currentOverlay ? renderOverlayContent() : renderBNBPageContent()}
        {isFilterModalOpen && (
          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            locationPermissionDenied={locationPermissionDenied} 
          />
        )}
      </div>
      <BottomNavigationBar activeBNBTab={activeBNBTab} setActiveBNBTab={setActiveBNBTab} favoriteCount={favoriteVenueSettings.length} />
    </div>
  );
};

// App component now wraps AppContent with all providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <LocationProvider>
            <FiltersProvider>
              <VenuesProvider>
                <FavoritesProvider>
                  <FriendsProvider>
                    <PlannerProvider> {/* PlannerProvider now wraps AIChatProvider */}
                      <AIChatProvider> 
                          <AppContent />
                      </AIChatProvider>
                    </PlannerProvider>
                  </FriendsProvider>
                </FavoritesProvider>
              </VenuesProvider>
            </FiltersProvider>
          </LocationProvider>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
