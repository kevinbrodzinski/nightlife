// Utility function to get the day of the week (e.g., "Monday") from an ISO date string
export const getDayOfWeekFromISODate = (isoDateString: string): string => {
  // Ensure the date is interpreted in local time by specifying T00:00:00
  // This avoids potential off-by-one day errors due to UTC conversion with bare date strings.
  const date = new Date(`${isoDateString}T00:00:00`);
  return date.toLocaleString('en-US', { weekday: 'long' });
};

// Utility function to format an ISO date string for display (e.g., "Mon, Aug 15")
export const formatISODateForDisplay = (isoDateString: string, type: 'short' | 'long' | 'dayLabel' = 'short'): string => {
  const date = new Date(`${isoDateString}T00:00:00`);
  if (type === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (type === 'dayLabel') { // For filter controls
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const inputDate = new Date(`${isoDateString}T00:00:00`);
    inputDate.setHours(0,0,0,0);

    if (inputDate.getTime() === today.getTime()) return "Today";
    if (inputDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  // Default 'short'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Utility function to format an ISO date string for AI Prompt (e.g., "Monday, August 15th, 2024")
export const formatISODateForAIPrompt = (isoDateString: string): string => {
  const date = new Date(`${isoDateString}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
