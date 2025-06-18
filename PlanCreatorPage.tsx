
import React, { useState } from 'react';
import type { PlannerActivityOption, UserPlan } from '../types'; // Added UserPlan
import { PLANNER_ACTIVITY_OPTIONS, MAX_PLANNER_SELECTIONS } from '../constants';
import { formatISODateForDisplay } from '../utils/date'; // For formatting plan date
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { EyeIcon } from './icons/EyeIcon'; // For View Plan button
import { TrashIcon } from './icons/TrashIcon'; // For Delete Plan button
import { BookmarkIcon } from './icons/BookmarkIcon'; // For Saved Plans section

interface PlanCreatorPageProps {
  selectedActivities: string[];
  onSelectActivity: (activities: string[]) => void;
  onGeneratePlan: () => void;
  onJoinPlan: (planCode: string) => void;
  onSwitchToAI: () => void;
  savedPlans: UserPlan[]; // New prop
  onLoadSavedPlan: (planId: string) => void; // New prop
  onDeleteSavedPlan: (planId: string) => void; // New prop
}

export const PlanCreatorPage: React.FC<PlanCreatorPageProps> = ({
  selectedActivities,
  onSelectActivity,
  onGeneratePlan,
  onJoinPlan,
  onSwitchToAI,
  savedPlans,
  onLoadSavedPlan,
  onDeleteSavedPlan,
}) => {
  const [planCodeToJoin, setPlanCodeToJoin] = useState('');

  const handleActivityToggle = (activityValue: string) => {
    const currentIndex = selectedActivities.indexOf(activityValue);
    let newSelections = [...selectedActivities];

    if (currentIndex > -1) {
      newSelections.splice(currentIndex, 1); // Deselect
    } else {
      if (newSelections.length < MAX_PLANNER_SELECTIONS) {
        newSelections.push(activityValue); // Select
      }
    }
    onSelectActivity(newSelections);
  };

  const handleClearSelections = () => {
    onSelectActivity([]);
  };

  const canGeneratePlan = selectedActivities.length > 0 && selectedActivities.length <= MAX_PLANNER_SELECTIONS;

  const getSelectedActivityLabel = (value: string): string => {
    return PLANNER_ACTIVITY_OPTIONS.find(opt => opt.value === value)?.label || value;
  }

  const handleJoinPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (planCodeToJoin.trim()) {
      onJoinPlan(planCodeToJoin.trim().toUpperCase());
      setPlanCodeToJoin('');
    }
  };
  
  const sortedSavedPlans = [...savedPlans].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Switch to AI Planner */}
      <div className="p-4 bg-slate-800 rounded-xl shadow-lg text-center">
        <button
          onClick={onSwitchToAI}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
          Chat with AI Nightlife Concierge (Nova)
        </button>
        <p className="text-xs text-slate-500 mt-2">Or, use the manual planner or view saved plans below.</p>
      </div>

      {/* Saved Plans Section */}
      {sortedSavedPlans.length > 0 && (
        <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-sky-400 mb-1 flex items-center justify-center sm:justify-start">
              <BookmarkIcon className="w-7 h-7 mr-2 text-yellow-400" /> My Saved Plans
            </h2>
            <p className="text-sm text-slate-400">Load a previous itinerary or manage your saved plans.</p>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-2">
            {sortedSavedPlans.map(plan => (
              <div key={plan.id} className="p-3 bg-slate-700/70 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 hover:bg-slate-600/50 transition-colors">
                <div>
                  <p className="text-md font-semibold text-teal-300">{plan.name}</p>
                  <p className="text-xs text-slate-400">
                    Created: {formatISODateForDisplay(plan.createdAt.substring(0,10), 'short')}
                  </p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onLoadSavedPlan(plan.id)}
                    className="flex items-center px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium"
                    aria-label={`View plan ${plan.name}`}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" /> View
                  </button>
                  <button
                    onClick={() => onDeleteSavedPlan(plan.id)}
                    className="flex items-center px-3 py-1.5 text-xs bg-red-700 hover:bg-red-600 text-white rounded-md font-medium"
                    aria-label={`Delete plan ${plan.name}`}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Create New Manual Plan Section */}
      <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl space-y-8">
        <div className="text-center">
          <SparklesIcon className="w-10 h-10 text-yellow-400 mx-auto mb-2 opacity-80" />
          <h1 className="text-2xl font-bold text-sky-400 mb-1">Manual Night Planner</h1>
          <p className="text-slate-400 text-sm">Select 1 to {MAX_PLANNER_SELECTIONS} activities for your night, in order.</p>
        </div>

        {selectedActivities.length > 0 && (
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Your Plan Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {selectedActivities.map((activityValue, index) => (
                <li key={index} className="text-teal-300">
                  {index + 1}. {getSelectedActivityLabel(activityValue)}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div>
          <h2 className="text-md font-semibold text-slate-200 mb-2">Choose Your Activities:</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {PLANNER_ACTIVITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleActivityToggle(option.value)}
                disabled={selectedActivities.length >= MAX_PLANNER_SELECTIONS && !selectedActivities.includes(option.value)}
                className={`px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm rounded-lg font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center space-x-1.5 sm:space-x-2
                  ${selectedActivities.includes(option.value)
                    ? 'bg-teal-500 text-white shadow-md focus:ring-teal-400'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-100 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                {option.emoji && <span className="text-md sm:text-lg">{option.emoji}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={handleClearSelections}
            disabled={selectedActivities.length === 0}
            className="flex-1 px-6 py-3 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Selections
          </button>
          <button
            onClick={onGeneratePlan}
            disabled={!canGeneratePlan}
            className="flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Generate Manual Plan
          </button>
        </div>
      </div>

      {/* Join Existing Plan Section */}
      <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
        <div className="text-center">
            <UserPlusIcon className="w-10 h-10 text-teal-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-sky-400 mb-1">Join a Friend's Plan</h2>
            <p className="text-sm text-slate-400">Got an invite code? Enter it below to join the fun!</p>
        </div>
        <form onSubmit={handleJoinPlanSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={planCodeToJoin}
            onChange={(e) => setPlanCodeToJoin(e.target.value.toUpperCase())}
            placeholder="Enter Plan Code (e.g., XYZ123)"
            maxLength={6}
            className="flex-grow px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
          />
          <button
            type="submit"
            disabled={!planCodeToJoin.trim()}
            className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Join Plan
          </button>
        </form>
      </div>
    </div>
  );
};
