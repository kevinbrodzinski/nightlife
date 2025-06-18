
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { RawVenueData } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not found. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if API_KEY is undefined during init

export const fetchInitialVenueData = async (): Promise<RawVenueData[]> => {
  if (!API_KEY) {
    throw new Error("API Key for Gemini is not configured. Cannot fetch venue data.");
  }
  
  const prompt = `
Generate a JSON array of 30 fictional entertainment venues in Los Angeles.
Each venue object must have the following properties:
- "id": a unique string identifier (e.g., "venue-1", "venue-2"). Use sequential numbers for easier random image generation.
- "name": a creative and plausible name for the venue (e.g., "The Midnight Bloom", "Electric Owl Cantina", "The Scholar's Pub").
- "address": a fictional street address (e.g., "123 Main St, Los Angeles, CA").
- "latitude": a number between 33.9500 and 34.1500 (Los Angeles area). Use 4 decimal places.
- "longitude": a number between -118.5000 and -118.1500 (Los Angeles area). Use 4 decimal places.
- "category": a string from the following list: "Sports Bar", "Cocktail Lounge", "Dive Bar", "Restaurant & Bar", "Live Music Club", "Rooftop Bar", "Gastropub", "Wine Bar", "Nightclub", "Brewery".
- "description": a short, enticing description (1-2 sentences).
- "tags": an array of 2-4 string tags relevant to the venue (e.g., ["live music", "craft beer", "rooftop", "dancing", "happy hour", "sports", "cozy", "upscale"]).
- "historicalPopularity": an object where keys are days of the week ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"). Each day's value is an object where keys are hours (as strings, e.g., "17", "18", "19", "20", "21", "22", "23", "00", "01", "02") and values are popularity strings: "Very Crowded", "Busy", "Moderate", "Light", "Empty". IMPORTANT: These popularity string values (e.g., "Very Crowded", "Busy") MUST be enclosed in double quotes in the JSON output. For instance, a valid entry would be "23": "Very Crowded". Ensure a variety of popularity patterns across venues, days, and times. For example, a nightclub might be empty on Tuesday evening but Very Crowded on Saturday at midnight. A restaurant might be Busy at 19:00 on weekdays. Ensure all hours from 17:00 (5 PM) to 02:00 (2 AM) are covered for each day.
- "bannerImage": A placeholder image URL using picsum.photos, in the format "https://picsum.photos/seed/VENUE_ID_NUM/600/200" where VENUE_ID_NUM is the number from the id (e.g., if id is "venue-5", use "https://picsum.photos/seed/5/600/200").

The output MUST be a valid JSON array of these venue objects. Do not include any explanatory text before or after the JSON array.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, // Add some variability but keep it mostly structured
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as RawVenueData[];
    // Basic validation
    if (!Array.isArray(parsedData) || parsedData.length === 0 || !parsedData[0].id || !parsedData[0].historicalPopularity) {
        console.error("Parsed data is not in the expected format:", parsedData);
        throw new Error("Gemini API returned data in an unexpected format.");
    }
    return parsedData;

  } catch (error) {
    console.error("Error fetching or parsing venue data from Gemini:", error);
    if (error instanceof Error) {
        // Check if the error is a SyntaxError and includes details about the problematic token
        if (error.name === 'SyntaxError' && error.message.includes("JSON")) {
             throw new Error(`Gemini API returned malformed JSON for venue data. Please check the model's output or prompt. Details: ${error.message}`);
        }
        throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching venue data from Gemini.");
  }
};
