import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { AIChatMessage, GeminiAIPlannerResponse, Venue, GeminiAIAction } from '../types';
import { GEMINI_MODEL_NAME, TIME_SLOTS } from '../constants';
import { processAIResponseText, getNovaSystemInstruction } from '../services/aiPlannerService';
import { useToast } from './ToastContext';
import { useFilters } from './FiltersContext';
import { useVenues } from './VenuesContext';
import { usePlanner } from './PlannerContext'; 
import { formatISODateForDisplay, formatISODateForAIPrompt, getDayOfWeekFromISODate } from '../utils/date';
import { PopularityLevel as PopularityLevelEnum } from '../types';


interface AIChatContextType {
  aiChatMessages: AIChatMessage[];
  isAIChatLoading: boolean;
  aiPlannerError: string | null;
  aiChatSession: Chat | null;
  handleSendAIChatMessage: (messageText: string, isSystemUserUpdate?: boolean) => Promise<void>;
  addSystemMessageToAIChat: (text: string, action?: GeminiAIAction) => void;
  resetAIChat: (greetingMessage?: string) => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const AIChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { selectedDay, selectedTime, defaultDay } = useFilters();
  const { processedVenues } = useVenues();
  const { generatedItinerary } = usePlanner(); 

  const [aiChatMessages, setAIChatMessages] = useState<AIChatMessage[]>([]);
  const [isAIChatLoading, setIsAIChatLoading] = useState<boolean>(false);
  const [aiChatSession, setAIChatSession] = useState<Chat | null>(null);
  const [aiPlannerError, setAIPlannerError] = useState<string | null>(null);

  const resetAIChat = useCallback((greetingMessage?: string) => {
    const currentDefaultDay = defaultDay();
    const greetingText = greetingMessage || `Hi! I'm Nova, your personal nightlife concierge for ${formatISODateForDisplay(currentDefaultDay, 'short')}. What are you in the mood for tonight?`;
    
    if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const timeLabelForPrompt = TIME_SLOTS.find(t => t.value === selectedTime)?.label || selectedTime;
        const systemInstruction = getNovaSystemInstruction(formatISODateForAIPrompt(selectedDay), timeLabelForPrompt);
        const chat = ai.chats.create({ model: GEMINI_MODEL_NAME, config: { systemInstruction } });
        setAIChatSession(chat);
        setAIChatMessages([{ 
            id: 'nova-greeting-reset-' + Date.now(), 
            role: 'model', 
            text: greetingText,
            timestamp: new Date(),
            actionResponse: { action: 'clarify', responseText: greetingText }
        }]);
    } else {
        setAIChatMessages([]);
        setAIPlannerError("API Key for AI Concierge is not configured.");
    }
    setAIPlannerError(null); // Clear previous errors on reset
  }, [defaultDay, selectedDay, selectedTime, showToast]);


  useEffect(() => {
    // Initialize chat on mount and if API key becomes available
    if (process.env.API_KEY && !aiChatSession) {
        resetAIChat(); // This will set up the initial session and greeting
    } else if (!process.env.API_KEY && aiChatMessages.length === 0) {
        setAIPlannerError("API Key for AI Concierge is not configured.");
    }
  }, [process.env.API_KEY, aiChatSession, resetAIChat, aiChatMessages.length]);
  
  useEffect(() => {
    // Re-initialize chat session when selectedDay or selectedTime changes
    // to update the system prompt with the new context.
    if (aiChatSession && process.env.API_KEY) { 
        console.log("Day or Time changed, re-initializing AI Chat for new context.");
        resetAIChat(`Okay, planning for ${formatISODateForDisplay(selectedDay, 'short')} around ${TIME_SLOTS.find(t => t.value === selectedTime)?.label || selectedTime}! What's the plan?`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, selectedTime]); // Deliberately not including aiChatSession or resetAIChat to avoid loops, only on day/time change


  const addSystemMessageToAIChat = useCallback((text: string, action: GeminiAIAction = 'clarify') => {
      const systemMessage: AIChatMessage = {
          id: 'system-info-' + Date.now(),
          role: 'model', 
          text: text,
          timestamp: new Date(),
          actionResponse: { action: action, responseText: text }
      };
      setAIChatMessages(prev => [...prev, systemMessage]);
  }, []);


  const handleSendAIChatMessage = useCallback(async (messageText: string, isSystemUserUpdate: boolean = false) => {
    if (!aiChatSession || !messageText.trim() || !process.env.API_KEY) {
      if (!process.env.API_KEY) showToast("AI Concierge is unavailable (API key missing).", "error");
      else if (!aiChatSession) showToast("AI session not ready. Please wait.", "error");
      return;
    }

    if (!isSystemUserUpdate) {
        const userMessage: AIChatMessage = { id: 'user-' + Date.now(), role: 'user', text: messageText, timestamp: new Date() };
        setAIChatMessages(prev => [...prev, userMessage]);
    }
    setIsAIChatLoading(true);
    setAIPlannerError(null);

    const modelThinkingMessage: AIChatMessage = { id: 'model-loading-' + Date.now(), role: 'model', text: "Nova is thinking...", timestamp: new Date(), isLoading: true };
    setAIChatMessages(prev => [...prev, modelThinkingMessage]);

    try {
      const response = await aiChatSession.sendMessage({ message: messageText });
      setIsAIChatLoading(false);
      const aiResponseJson = processAIResponseText(response.text);
      
      if (!aiResponseJson || !aiResponseJson.responseText) throw new Error("AI response was not valid or was empty.");
      
      const modelResponseMessage: AIChatMessage = {
        id: 'model-' + Date.now(), role: 'model', text: aiResponseJson.responseText,
        timestamp: new Date(), actionResponse: aiResponseJson, suggestedVenues: [],
      };

      if (aiResponseJson.action === 'filter_venues' && aiResponseJson.keywords) {
        const keywords = aiResponseJson.keywords.map(k => k.toLowerCase());
        const dayOfWeekForFilter = getDayOfWeekFromISODate(selectedDay);
        const suggested = processedVenues.filter(v => {
            const venueDayPopularity = v.historicalPopularity[dayOfWeekForFilter];
            const venueCurrentPopularity = venueDayPopularity ? venueDayPopularity[selectedTime] : undefined;
            // Allow "busy" keyword to match even empty venues if it's the only keyword, otherwise filter out empty if busy is not explicitly requested
            if (venueCurrentPopularity === PopularityLevelEnum.EMPTY && !(keywords.length === 1 && keywords[0] === "busy")) {
                 if (!keywords.includes("empty") && !keywords.includes("quiet") && !keywords.includes("light")) return false;
            }
            return keywords.some(kw => v.name.toLowerCase().includes(kw) || v.category.toLowerCase().includes(kw) || v.tags.some(tag => tag.toLowerCase().includes(kw)));
        }).sort((a,b) => (b.currentPopularityScore || 0) - (a.currentPopularityScore || 0)).slice(0, 3);

        if (suggested.length > 0) modelResponseMessage.suggestedVenues = suggested;
        else {
          modelResponseMessage.text = `Hmm, I couldn't find exactly that for ${formatISODateForDisplay(selectedDay, 'short')}. How about we try a different vibe or activity?`;
          modelResponseMessage.actionResponse = { action: 'no_venues_found_ack', responseText: modelResponseMessage.text };
          // Optionally, send a system message back to AI for more context, but handle carefully to avoid loops
          // const noVenueSystemMsg = `System: No venues found for keywords: ${aiResponseJson.keywords.join(', ')}. User's original request was "${messageText}". We are planning for ${formatISODateForAIPrompt(selectedDay)}. Please suggest something else or ask to broaden the search.`;
          // await handleSendAIChatMessage(noVenueSystemMsg, true); // CAUTION: Potential loop
        }
      } else if (aiResponseJson.action === 'show_plan' || aiResponseJson.action === 'complete_plan') {
        if (!generatedItinerary || generatedItinerary.length === 0) {
          modelResponseMessage.text = "Your plan is currently empty. Let's add some stops!";
          modelResponseMessage.actionResponse = {...aiResponseJson, responseText: modelResponseMessage.text, action: 'clarify' };
        } else {
          // App.tsx will show PlanResultsPage via PlannerContext/App's navigation logic
          // Triggered by usePlanner().setCurrentPlannerView elsewhere or by navigation
        }
      }
      setAIChatMessages(prev => prev.filter(m => m.id !== modelThinkingMessage.id).concat(modelResponseMessage));

    } catch (error) {
      console.error("Error sending/receiving AI chat message:", error);
      setIsAIChatLoading(false);
      const errorMessageContent = error instanceof Error ? error.message : "An unknown error occurred.";
      setAIPlannerError(`AI Concierge error: ${errorMessageContent}`);
      const errorResponseMessage: AIChatMessage = {
        id: 'model-error-' + Date.now(), role: 'model',
        text: `Sorry, I encountered a problem: ${errorMessageContent}. Please try again.`,
        timestamp: new Date(), isError: true,
      };
      setAIChatMessages(prev => prev.filter(m => m.id !== modelThinkingMessage.id).concat(errorResponseMessage));
      showToast("Error communicating with AI Concierge.", "error");
    }
  }, [aiChatSession, processedVenues, showToast, generatedItinerary, selectedDay, selectedTime, formatISODateForDisplay, getDayOfWeekFromISODate]);

  return (
    <AIChatContext.Provider value={{
      aiChatMessages,
      isAIChatLoading,
      aiPlannerError,
      aiChatSession,
      handleSendAIChatMessage,
      addSystemMessageToAIChat,
      resetAIChat,
    }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = (): AIChatContextType => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};
