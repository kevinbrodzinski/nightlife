import type { DayOption, TimeOption, PlannerActivityOption, FeedItem } from './types';
import { PopularityLevel, FeedItemType } from './types';

// DAYS_OF_WEEK is now primarily for utility (e.g., getting day name from a date).
// Date selection will use a date picker input.
export const DAYS_OF_WEEK: DayOption[] = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

// Hours from 5 PM (17) to 2 AM (02)
export const TIME_SLOTS: TimeOption[] = [
  { value: "17", label: "5:00 PM" }, { value: "18", label: "6:00 PM" },
  { value: "19", label: "7:00 PM" }, { value: "20", label: "8:00 PM" },
  { value: "21", label: "9:00 PM" }, { value: "22", label: "10:00 PM" },
  { value: "23", label: "11:00 PM" }, { value: "00", label: "12:00 AM (Midnight)" },
  { value: "01", label: "1:00 AM" }, { value: "02", label: "2:00 AM" },
];

export const POPULARITY_LEVELS: PopularityLevel[] = [
  PopularityLevel.EMPTY,
  PopularityLevel.LIGHT,
  PopularityLevel.MODERATE,
  PopularityLevel.BUSY,
  PopularityLevel.VERY_CROWDED,
];

// Order for sorting, index is score
export const POPULARITY_ORDER: PopularityLevel[] = [
  PopularityLevel.EMPTY,       // 0
  PopularityLevel.LIGHT,       // 1
  PopularityLevel.MODERATE,    // 2
  PopularityLevel.BUSY,        // 3
  PopularityLevel.VERY_CROWDED // 4
];


export const POPULARITY_COLORS: Record<PopularityLevel, string> = {
  [PopularityLevel.VERY_CROWDED]: "bg-red-500 text-white",
  [PopularityLevel.BUSY]: "bg-orange-500 text-white",
  [PopularityLevel.MODERATE]: "bg-yellow-500 text-slate-900",
  [PopularityLevel.LIGHT]: "bg-green-500 text-white",
  [PopularityLevel.EMPTY]: "bg-blue-500 text-white",
};

export const POPULARITY_TEXT_COLORS: Record<PopularityLevel, string> = {
  [PopularityLevel.VERY_CROWDED]: "text-red-400",
  [PopularityLevel.BUSY]: "text-orange-400",
  [PopularityLevel.MODERATE]: "text-yellow-400",
  [PopularityLevel.LIGHT]: "text-green-400",
  [PopularityLevel.EMPTY]: "text-blue-400",
};

export const POPULARITY_BORDER_COLORS: Record<PopularityLevel, string> = {
  [PopularityLevel.VERY_CROWDED]: "border-red-500",
  [PopularityLevel.BUSY]: "border-orange-500",
  [PopularityLevel.MODERATE]: "border-yellow-500",
  [PopularityLevel.LIGHT]: "border-green-500",
  [PopularityLevel.EMPTY]: "border-blue-500",
};

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const SUGGESTION_CHIPS: Array<{label: string; query: string; icon?: string}> = [
  { label: "Dance", query: "dance", icon: "🎉" },
  { label: "Chill", query: "chill", icon: "🍹" },
  { label: "Live Music", query: "live music", icon: "🎸" },
  { label: "Bar Hop", query: "bar hop", icon: "🍻" },
  { label: "Rooftop", query: "rooftop", icon: "🏙️" },
  { label: "Gastropub", query: "gastropub", icon: "🍔" },
  { label: "Sports Bar", query: "sports bar", icon: "⚽" },
];

// Filter Options for Modal
export const VENUE_TYPES: Array<{value: string; label: string}> = [
    { value: "Sports Bar", label: "Sports Bar" },
    { value: "Cocktail Lounge", label: "Cocktail Lounge" },
    { value: "Dive Bar", label: "Dive Bar" },
    { value: "Restaurant & Bar", label: "Restaurant & Bar" },
    { value: "Live Music Club", label: "Live Music Club" },
    { value: "Rooftop Bar", label: "Rooftop Bar" },
    { value: "Gastropub", label: "Gastropub" },
    { value: "Wine Bar", label: "Wine Bar" },
    { value: "Nightclub", label: "Nightclub" },
    { value: "Brewery", label: "Brewery" },
];

export const VIBE_OPTIONS: Array<{value: string; label: string}> = [
    { value: "chill", label: "Chill" },
    { value: "energetic", label: "Energetic" },
    { value: "upscale", label: "Upscale" },
    { value: "divey", label: "Divey" },
    { value: "romantic", label: "Romantic" },
    { value: "cozy", label: "Cozy" },
    { value: "lively", label: "Lively" },
    { value: "sports", label: "Sports" },
];

export const FEATURE_OPTIONS: Array<{value: string; label: string}> = [
    { value: "live music", label: "Live Music" },
    { value: "dj", label: "DJ / Dance Floor" },
    { value: "happy hour", label: "Happy Hour" },
    { value: "outdoor seating", label: "Outdoor Seating" },
    { value: "craft beer", label: "Craft Beer" },
    { value: "full menu", label: "Full Menu" },
    { value: "games", label: "Games (Pool, Darts, etc.)" },
];

// Convert PopularityLevel enum to options for selection
export const POPULARITY_LEVEL_OPTIONS: Array<{value: PopularityLevel; label: string}> = 
  POPULARITY_LEVELS.map(level => ({value: level, label: level}));


export const DISTANCE_OPTIONS: Array<{value: string; label: string}> = [
    { value: "any", label: "Any Distance" },
    { value: "1", label: "< 1 mile" },
    { value: "3", label: "< 3 miles" },
    { value: "5", label: "< 5 miles" },
];

// Styles for Map View "Pins" (LocationCards in map mode)
export const MAP_PIN_STYLES: Record<PopularityLevel, { bgColor: string; iconColor: string; scaleClass: string; textColor: string; label: string; }> = {
  [PopularityLevel.VERY_CROWDED]: { 
    bgColor: 'bg-red-600', 
    iconColor: 'text-red-100', 
    scaleClass: 'scale-110', 
    textColor: 'text-red-50',
    label: PopularityLevel.VERY_CROWDED
  },
  [PopularityLevel.BUSY]: { 
    bgColor: 'bg-orange-500', 
    iconColor: 'text-orange-100', 
    scaleClass: 'scale-105', 
    textColor: 'text-orange-50',
    label: PopularityLevel.BUSY
  },
  [PopularityLevel.MODERATE]: { 
    bgColor: 'bg-yellow-500', 
    iconColor: 'text-yellow-800', 
    scaleClass: 'scale-100', 
    textColor: 'text-yellow-900',
    label: PopularityLevel.MODERATE
  },
  [PopularityLevel.LIGHT]: { 
    bgColor: 'bg-green-500', 
    iconColor: 'text-green-100', 
    scaleClass: 'scale-95', 
    textColor: 'text-green-50',
    label: PopularityLevel.LIGHT
  },
  [PopularityLevel.EMPTY]: { 
    bgColor: 'bg-sky-500', 
    iconColor: 'text-sky-100', 
    scaleClass: 'scale-90', 
    textColor: 'text-sky-50',
    label: PopularityLevel.EMPTY
  },
};

export const MAX_PLANNER_SELECTIONS = 3;

// Options for "Plan My Night" feature
export const PLANNER_ACTIVITY_OPTIONS: PlannerActivityOption[] = [
  { value: "dinner", label: "Dinner", emoji: "🍽️", relatedCategory: "Restaurant & Bar", defaultDurationMinutes: 90 },
  { value: "drinks", label: "Drinks", emoji: "🍹", relatedCategory: "Bar", defaultDurationMinutes: 60 }, // Generic bar
  { value: "cocktails", label: "Cocktails", emoji: "🍸", relatedCategory: "Cocktail Lounge", defaultDurationMinutes: 90 },
  { value: "live music", label: "Live Music", emoji: "🎸", relatedCategory: "Live Music Club", defaultDurationMinutes: 120 },
  { value: "dancing", label: "Dancing", emoji: "💃", relatedCategory: "Nightclub", defaultDurationMinutes: 120 },
  { value: "show", label: "Show/Event", emoji: "🎟️", defaultDurationMinutes: 120 }, // Less specific category match
  { value: "chill bar", label: "Chill Bar", emoji: "🛋️", relatedCategory: "Bar", defaultDurationMinutes: 90 }, // Can match Dive Bar, Wine Bar etc.
  { value: "rooftop", label: "Rooftop", emoji: "🏙️", relatedCategory: "Rooftop Bar", defaultDurationMinutes: 90 },
  { value: "brewery", label: "Brewery Visit", emoji: "🍺", relatedCategory: "Brewery", defaultDurationMinutes: 75 },
  { value: "sports bar", label: "Watch Game", emoji: "⚽", relatedCategory: "Sports Bar", defaultDurationMinutes: 120 },
];


// Sample Data for Content Feed
export const SAMPLE_FEED_DATA: FeedItem[] = [
  {
    id: "feed-item-1",
    type: FeedItemType.TRENDING_VENUE,
    data: {
      venueId: "venue-1", 
      customTitle: "🔥 Hot Right Now: The Velvet Lounge",
      highlightTag: "Live Jazz Every Friday!"
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: "feed-item-2",
    type: FeedItemType.CURATED_LIST,
    data: {
      title: "🍹 Top 3 Cocktail Bars for Tonight",
      description: "Sip in style at these highly-rated cocktail lounges, perfect for your evening.",
      items: [
        { venueId: "venue-2", note: "Known for their Old Fashioned" }, 
        { venueId: "venue-3", note: "Creative mixology" }, 
        { venueId: "venue-4" }, 
      ],
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feed-item-3",
    type: FeedItemType.EVENT_HIGHLIGHT,
    data: {
      eventName: "DJ Night with SparklePony",
      venueName: "Electric Owl Cantina (or associated venue)", 
      venueId: "venue-5", 
      date: "This Saturday",
      time: "10 PM - Late",
      imageUrl: "https://picsum.photos/seed/event1/600/300",
      description: "Get ready to dance the night away with the electrifying beats of DJ SparklePony!"
    },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feed-item-4",
    type: FeedItemType.TIP_ARTICLE,
    data: {
      title: "5 Tips to Get Into Any Hotspot",
      snippet: "Tired of waiting in line? Our insiders share their secrets to navigating the city's most exclusive doors...",
      imageUrl: "https://picsum.photos/seed/tip1/600/300",
      readMoreLink: "#" 
    },
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feed-item-5",
    type: FeedItemType.AI_RECOMMENDATION,
    data: {
      title: "For You: Vibes Similar to 'The Scholar's Pub'",
      description: "If you like a cozy pub atmosphere, you might also enjoy these spots!",
      recommendedVenueIds: ["venue-6", "venue-7"] 
    },
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feed-item-6",
    type: FeedItemType.TRENDING_VENUE,
    data: {
      venueId: "venue-8", 
      highlightTag: "New Rooftop Opening!"
    },
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
  },
];

// Utility function to get today's date in YYYY-MM-DD format
export const getTodayISODate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
