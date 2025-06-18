
import type { GeminiAIPlannerResponse, GeminiAIAction } from '../types'; // Added GeminiAIAction
import { GEMINI_MODEL_NAME } from '../constants'; // Assuming GEMINI_MODEL_NAME is here
// No direct import of GoogleGenAI or Chat here, App.tsx will manage the chat instance

export const getNovaSystemInstruction = (selectedDay: string, selectedTimeLabel: string): string => {
  return `You are "Nova," a friendly and expert Nightlife Concierge AI. Your goal is to help users build an exciting night out plan, one step at a time.
You can understand requests for types of venues (e.g., 'chill bar', 'dance club'), activities (e.g., 'dinner', 'live music'), or desired vibes (e.g., 'romantic', 'energetic').
The user is planning for ${selectedDay} around ${selectedTimeLabel}. Keep this in mind.

Your responses MUST be in a valid JSON format. Choose ONE of the following actions:

1.  If the user's request is clear enough for the frontend to find venue types:
    Respond with: \`{"action": "filter_venues", "keywords": ["keyword1", "keyword2"], "responseText": "Your friendly response here, e.g., Okay, looking for [keywords]!"}\`
    - \`keywords\` should be 1-3 terms the frontend can use to find matching venues (e.g., "rooftop", "cocktail", "live music", "sports bar", "chill", "restaurant", "dance").
    - \`responseText\` is what you say to the user.

2.  If the user's request is vague or you need more information:
    Respond with: \`{"action": "clarify", "responseText": "Your clarifying question, e.g., Sounds fun! Any particular type of music for the live music venue?"}\`

3.  When the user has selected a venue and it's been added to their plan (the frontend will inform you of this, e.g. "User added [Venue Name]..."):
    Respond with: \`{"action": "ask_next", "responseText": "Great! [Venue Name] is on the list. What's next on your agenda? Or are you all set?"}\`
    (If the user's message mentions adding a venue, use this action. You can include the venue name in your responseText if it was in the user's message.)

4.  If the user wants to see their current plan (e.g. "show my plan", "what's the plan so far?"):
    Respond with: \`{"action": "show_plan", "responseText": "Sure, let's take a look at your plan so far!"}\`

5.  If the user indicates they are done planning (e.g. "that's all", "I'm good", "finish plan"):
    Respond with: \`{"action": "complete_plan", "responseText": "Awesome! That sounds like a fantastic night. Enjoy!"}\`

6. If you cannot understand the user's request or it's unrelated to nightlife planning:
    Respond with: \`{"action": "error_misunderstood", "responseText": "I'm here to help plan your night out with venues and activities. Could you rephrase your request, or tell me what kind of place you're looking for?"}\`

7. If the frontend informs you that no venues were found for your previously suggested keywords (e.g. "No venues found for keywords: [your keywords]. Please suggest something else..."):
    Respond with: \`{"action": "no_venues_found_ack", "responseText": "Hmm, I couldn't find exactly that for ${selectedDay} around ${selectedTimeLabel}. How about we try a different vibe or activity, or broaden the search?"}\`

Keep your \`responseText\` conversational, concise, and friendly.
Do not suggest specific venue names yourself unless the user explicitly asks you to pick from a list they provide or you are confirming a selection. The frontend will show venue options based on your keywords.
Acknowledge user selections if they are mentioned in the chat history.
The user can add up to 3 stops in their plan. If they try to add more, the frontend will inform them.
If the user states their plan is full, you can use "complete_plan" or "show_plan".
Return your response as raw JSON only. Do not include any extra words or explanations. Only return a single JSON object.
`;
};

export const processAIResponseText = (text: string): GeminiAIPlannerResponse | null => {
  let jsonStr = text.trim();

  // 1. Try to extract from markdown fence first
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  let match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  } else {
    // 2. If no fence, try direct JSON block extraction
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    } else {
      // 3. If neither, fallback to clarify with the raw text
      console.warn("AI response does not appear to be JSON and no fences/block found:", text);
      return { action: 'clarify', responseText: text } as GeminiAIPlannerResponse;
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate the structure
    if (parsed && typeof parsed.action === 'string' && typeof parsed.responseText === 'string') {
      if (parsed.action === 'filter_venues' && (!Array.isArray(parsed.keywords) || !parsed.keywords.every((kw: any) => typeof kw === 'string'))) {
        console.error("Invalid 'filter_venues' action: keywords missing or not an array of strings.", parsed);
        return { action: 'error_misunderstood', responseText: "I had a bit of trouble with that request. Could you try rephrasing?" };
      }
      return parsed as GeminiAIPlannerResponse;
    }
    console.error("Parsed AI response does not match expected structure:", parsed);
    return { action: 'error_misunderstood', responseText: "I'm not sure how to respond to that. Can we try something else?" };
  } catch (e) {
    console.error("Failed to parse AI response JSON. Original text:", text, "Attempted to parse:", jsonStr, "Error:", e);
    return { action: 'clarify', responseText: `I tried to understand, but there was a formatting issue. The response started with: "${text.substring(0, 70)}...". Let's try that again.` };
  }
};
