export enum PopularityLevel {
  EMPTY = "Empty",
  LIGHT = "Light",
  MODERATE = "Moderate",
  BUSY = "Busy",
  VERY_CROWDED = "Very Crowded",
}

export interface UserLocation {
  lat: number;
  lon: number;
}

export interface Venue {
  id: string;
  name:string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  tags: string[];
  historicalPopularity: {
    [dayOfWeek: string]: { // "Monday", "Tuesday", ...
      [hour: string]: PopularityLevel; // "17", "18", ..., "00", "01", "02"
    };
  };
  bannerImage: string;
  // Dynamically added client-side:
  currentPopularity?: PopularityLevel;
  currentPopularityScore?: number; // 0 (Empty) to 4 (Very Crowded) for sorting
  distanceInMiles?: number; 
}

export interface DayOption {
  value: string; // "Monday", "Tuesday" OR ISO Date string "YYYY-MM-DD"
  label: string;
}

export interface TimeOption {
  value: string; // "17", "18" (hour as string)
  label: string; // "5:00 PM", "6:00 PM"
}

// For Gemini response parsing
export interface RawVenueData extends Omit<Venue, 'currentPopularity' | 'currentPopularityScore' | 'distanceInMiles'> {}

// For Google Search grounding (if used, not in current scope but good to have)
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // other types of grounding chunks can be added here
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other grounding metadata fields
}

export interface FavoriteVenueSetting {
  id: string;
  notify: boolean; // User's preference for receiving notifications for this specific venue
}

// Navigation Types
export type ActiveBNBTab = 'home' | 'map' | 'favorites' | 'planner' | 'feed' | 'friends'; // Added 'friends'
export type AppOverlay = 'venueDetail' | 'settings' | null;
export type CurrentPlannerView = 'ai' | 'manual' | 'savedList';


export interface HeaderProps {
  appTitle: string;
  currentOverlay: AppOverlay;
  pageTitle?: string; // Specific title for overlays like venue name or "Settings"
  onBackClick: () => void;
  onSettingsClick: () => void;
}


// For "Plan My Night" feature
export interface PlannerActivityOption {
  value: string; // e.g., 'dinner', 'drinks', 'dancing'
  label: string; // e.g., "Dinner", "Cocktails", "Dance Club"
  emoji?: string; // Optional: for visual flair
  relatedCategory?: string; // Optional: Hint for matching this activity to a Venue.category
  defaultDurationMinutes?: number; // Optional: Typical duration for this activity
}

export interface PlannedItineraryItem {
  activityType: string; // The 'value' from PlannerActivityOption, e.g., 'dinner'
  activityLabel: string; // The 'label' from PlannerActivityOption, e.g., 'Dinner'
  venue: Venue;
  startTime: string; // e.g., "7:00 PM"
  endTime: string; // e.g., "8:30 PM"
  travelTimeToNext?: string; // e.g., "15 min drive" - optional, for the last item
  // Added for AI Planner context
  aiPromptText?: string; // The user prompt or context that led to this item
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// For "Go Out With Friends" feature
export type MemberPresenceStatus = 'at_venue' | 'on_the_way' | 'not_arrived' | 'left_venue';

export interface MemberPresence {
  currentVenueId: string | null; // Venue ID if at a venue in the plan
  status: MemberPresenceStatus;
}

export interface SharedPlan {
  planId: string; // Unique ID for this shared plan instance
  itinerary: PlannedItineraryItem[];
  creatorName: string; // Name of the user who created the plan
  members: string[]; // Array of member names (e.g., ["You", "Friend 1", "Friend 2"])
  memberPresence: Record<string, MemberPresence>; // Maps member name to their presence info
}

// For "Nightlife Content Feed" feature
export enum FeedItemType {
  TRENDING_VENUE = "trending_venue",
  CURATED_LIST = "curated_list",
  EVENT_HIGHLIGHT = "event_highlight",
  TIP_ARTICLE = "tip_article",
  AI_RECOMMENDATION = "ai_recommendation",
}

export interface TrendingVenueFeedData {
  venueId: string; // ID of the venue to feature
  customTitle?: string;
  highlightTag?: string; 
}

export interface CuratedListItem { 
  venueId: string;
  note?: string;
}

export interface CuratedListFeedData {
  title: string; 
  description?: string; 
  items: CuratedListItem[]; 
  viewAllLink?: string;
}

export interface EventHighlightFeedData {
  eventId?: string; 
  eventName: string;
  venueId?: string; 
  venueName?: string; 
  date: string; 
  time?: string; 
  imageUrl?: string; 
  description: string;
}

export interface TipArticleFeedData {
  title: string;
  snippet: string;
  imageUrl?: string;
  readMoreLink?: string; 
}

export interface AIRecommendationFeedData {
  title: string; 
  description?: string;
  recommendedVenueIds: string[]; 
}

export type FeedItem =
  | { id: string; type: FeedItemType.TRENDING_VENUE; data: TrendingVenueFeedData; timestamp?: string }
  | { id: string; type: FeedItemType.CURATED_LIST; data: CuratedListFeedData; timestamp?: string }
  | { id: string; type: FeedItemType.EVENT_HIGHLIGHT; data: EventHighlightFeedData; timestamp?: string }
  | { id: string; type: FeedItemType.TIP_ARTICLE; data: TipArticleFeedData; timestamp?: string }
  | { id: string; type: FeedItemType.AI_RECOMMENDATION; data: AIRecommendationFeedData; timestamp?: string };


// --- AI Chat Planner Types ---
export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  suggestedVenues?: Venue[]; // Venues suggested by frontend after AI interpretation
  isLoading?: boolean; // For model responses being loaded
  isError?: boolean; // If there was an error generating this model message
  actionResponse?: GeminiAIPlannerResponse; // Parsed action from model
}

export type GeminiAIAction = 
  | 'filter_venues' 
  | 'clarify' 
  | 'add_to_plan_ack' // AI acknowledges a venue was added by the user
  | 'ask_next' 
  | 'show_plan' 
  | 'complete_plan' 
  | 'error_misunderstood'
  | 'no_venues_found_ack'; // AI acknowledges frontend found no venues for its keywords

export interface GeminiAIPlannerResponse {
  action: GeminiAIAction;
  keywords?: string[]; // For filter_venues
  responseText: string;
  // venueId?: string; // Could be for add_to_plan_ack if AI needs to confirm which venue
}

// --- Saved Plans ---
export interface UserPlan {
  id: string; // Unique ID for this saved plan
  name: string; // User-defined or auto-generated name
  date: string; // ISO Date string for which the plan was made (e.g., "2024-08-15")
  time: string; // Time slot value (e.g., "19")
  itinerary: PlannedItineraryItem[];
  createdAt: string; // ISO string of when the plan was saved
}

// --- Saved Venues for Specific Days of Week ---
export interface SavedDayVenue {
  venueId: string;
  dayOfWeek: string; // "Monday", "Tuesday", etc., matching values from DAYS_OF_WEEK in constants
  notes?: string;    // Optional user notes, e.g., "Great happy hour"
  savedAt: string;   // ISO timestamp
}

// --- User Profile ---
export interface UserProfile {
  username: string;
  avatarColor?: string; // Optional: for UI distinction, e.g., "bg-blue-500" or hex
  // Potentially add avatarUrl, bio, etc. in the future
}