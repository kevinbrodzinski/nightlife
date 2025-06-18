import React, { useState, useRef, useEffect } from 'react';
import type { Venue, PlannedItineraryItem } from '../types';
import { ChatMessage } from './ChatMessage';
import { PaperAirplaneRightIcon } from './icons/PaperAirplaneRightIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

// Context Hooks
import { useAIChat } from '../contexts/AIChatContext';
import { usePlanner } from '../contexts/PlannerContext';

interface AIChatPlannerPageProps {
  onSwitchToManual: () => void; // Navigation callback
  onLoadSavedPlans: () => void; // Navigation callback
  onAddVenueToPlan: (venue: Venue, fromAiPrompt: string) => void; 
  onViewPlan: () => void; // Navigation callback
  onSelectVenue: (venue: Venue | string) => void; // Navigation callback
  maxPlannerSelections: number; // Max items in plan
}

export const AIChatPlannerPage: React.FC<AIChatPlannerPageProps> = ({
  onSwitchToManual,
  onLoadSavedPlans,
  onAddVenueToPlan, 
  onViewPlan,
  onSelectVenue,
  maxPlannerSelections
}) => {
  const { aiChatMessages, handleSendAIChatMessage, isAIChatLoading, aiPlannerError } = useAIChat();
  const { generatedItinerary: currentItinerary } = usePlanner();

  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiChatMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInput.trim() && !isAIChatLoading) {
      handleSendAIChatMessage(userInput.trim());
      setUserInput('');
    }
  };

  const planIsFull = currentItinerary && currentItinerary.length >= maxPlannerSelections;

  const handleViewPlanClick = () => {
    if (currentItinerary && currentItinerary.length > 0) {
      onViewPlan(); 
    } else {
      // Ask AI to show plan (it will say it's empty or clarify)
      handleSendAIChatMessage("Show me my plan"); 
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-12rem)] bg-slate-800 rounded-xl shadow-2xl animate-fadeIn">
      <div className="p-4 border-b border-slate-700 text-center">
        <h1 className="text-xl font-bold text-sky-400">Nova - Your AI Nightlife Concierge</h1>
        <p className="text-xs text-slate-400">Chat with Nova to plan your perfect night out!</p>
      </div>
      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
        {aiChatMessages.map((msg, index) => (
          <ChatMessage
            key={msg.id} message={msg}
            onAddVenueToPlan={(venue) => {
                let aiPromptContext = "AI suggestion";
                // Try to get more specific context from previous AI message if it was a filter_venues action
                if(index > 0 && aiChatMessages[index-1].role === 'model' && aiChatMessages[index-1].actionResponse?.keywords) {
                    aiPromptContext = `AI found venues for keywords: ${aiChatMessages[index-1].actionResponse.keywords.join(', ')}`;
                } else if (index > 0 && aiChatMessages[index-1].role === 'user') { // Fallback to user's last message
                    aiPromptContext = aiChatMessages[index-1].text;
                }
                onAddVenueToPlan(venue, aiPromptContext);
            }}
            onSelectVenue={onSelectVenue} planIsFull={planIsFull}
          />
        ))}
        {aiPlannerError && (<div className="p-3 bg-red-700/30 text-red-300 rounded-lg text-sm"><strong>Error:</strong> {aiPlannerError}</div>)}
      </div>
      <div className="p-2 border-t border-slate-700 flex flex-col sm:flex-row gap-2">
        <button onClick={handleViewPlanClick} disabled={(!currentItinerary || currentItinerary.length === 0) && aiChatMessages.length <=1 } className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed">
          <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
          {currentItinerary && currentItinerary.length > 0 ? `View Plan (${currentItinerary.length} Stop${currentItinerary.length === 1 ? '' : 's'})` : 'View Plan'}
        </button>
        <button onClick={onLoadSavedPlans} className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-900 bg-yellow-500 hover:bg-yellow-400 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-slate-800">
          <BookmarkIcon className="w-5 h-5 mr-2" /> Load Saved Plan
        </button>
        <button onClick={onSwitchToManual} className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800">
          <ArrowUturnLeftIcon className="w-5 h-5 mr-2" /> Use Manual Planner
        </button>
      </div>
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input type="text" value={userInput} onChange={handleInputChange} placeholder={isAIChatLoading ? "Nova is replying..." : (planIsFull ? "Your plan is full. View plan or start over." : "Tell Nova what you're looking for...")} className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out" disabled={isAIChatLoading || planIsFull} aria-label="Chat message input" />
          <button type="submit" disabled={isAIChatLoading || !userInput.trim() || planIsFull} className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message"><PaperAirplaneRightIcon className="w-6 h-6" /></button>
        </form>
      </div>
    </div>
  );
};