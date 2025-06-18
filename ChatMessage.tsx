
import React from 'react';
import type { AIChatMessage, Venue } from '../types';
import { VenueSuggestionCard } from './VenueSuggestionCard'; // Will create this
import { UserCircleIcon } from './icons/UserCircleIcon'; // Placeholder
import { SparklesIcon } from './icons/SparklesIcon'; // For AI/Nova

interface ChatMessageProps {
  message: AIChatMessage;
  onAddVenueToPlan: (venue: Venue) => void;
  onSelectVenue: (venue: Venue | string) => void; // For "More Info"
  planIsFull: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddVenueToPlan, onSelectVenue, planIsFull }) => {
  const isUser = message.role === 'user';
  const Icon = isUser ? UserCircleIcon : SparklesIcon;
  const bubbleClasses = isUser
    ? 'bg-sky-600 text-white self-end rounded-l-xl rounded-tr-xl'
    : 'bg-slate-700 text-slate-200 self-start rounded-r-xl rounded-tl-xl';
  const alignmentClasses = isUser ? 'items-end' : 'items-start';

  return (
    <div className={`flex flex-col w-full max-w-xs sm:max-w-md md:max-w-lg ${isUser ? 'ml-auto' : 'mr-auto'} ${alignmentClasses}`}>
      <div className={`flex items-end space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 p-1.5 rounded-full ${isUser ? 'bg-sky-500' : 'bg-teal-500'}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`px-4 py-3 ${bubbleClasses} shadow-md`}>
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
              <span className="text-sm italic">{message.text}</span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          )}
           {message.isError && <p className="text-xs text-red-300 mt-1">Message failed to send or process.</p>}
        </div>
      </div>
      
      {message.suggestedVenues && message.suggestedVenues.length > 0 && (
        <div className={`mt-2 flex flex-col space-y-2 ${isUser ? 'items-end' : 'items-start pl-10'}`}>
            <p className="text-xs text-slate-400 self-start ml-10 mb-1">Here are a few options based on that:</p>
            {message.suggestedVenues.map(venue => (
                <VenueSuggestionCard 
                    key={venue.id} 
                    venue={venue} 
                    onAdd={() => onAddVenueToPlan(venue)}
                    onMoreInfo={() => onSelectVenue(venue)}
                    planIsFull={planIsFull}
                    isAdded={false} // This would need more complex state if we want to show "Added"
                />
            ))}
        </div>
      )}
      
      {!isUser && !message.isLoading && (
        <p className="text-xs text-slate-500 mt-1 px-1 self-start ml-10">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
       {isUser && (
        <p className="text-xs text-slate-500 mt-1 px-1 self-end mr-10">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
};
