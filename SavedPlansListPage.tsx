
import React from 'react';
import { formatISODateForDisplay } from '../utils/date';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowSmallLeftIcon } from './icons/ArrowSmallLeftIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

// Context Hooks
import { usePlanner } from '../contexts/PlannerContext';

interface SavedPlansListPageProps {
  onLoadPlan: (planId: string) => void; 
  onBack: () => void; 
}

export const SavedPlansListPage: React.FC<SavedPlansListPageProps> = ({
  onLoadPlan,
  onBack,
}) => {
  const { savedPlans, handleDeleteSavedPlan } = usePlanner();

  const sortedSavedPlans = [...savedPlans].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sky-400 flex items-center">
          <BookmarkIcon className="w-7 h-7 mr-2 text-yellow-400" /> My Saved Plans
        </h1>
        <button onClick={onBack} className="flex items-center px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors" aria-label="Back to planner options">
          <ArrowSmallLeftIcon className="w-5 h-5 mr-1.5" /> Back
        </button>
      </div>

      {sortedSavedPlans.length === 0 ? (
        <div className="text-center py-10">
          <BookmarkIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">You haven't saved any plans yet.</p>
          <p className="text-sm text-slate-500 mt-1">Create a plan and save it for later!</p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-20rem)] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-2">
          {sortedSavedPlans.map(plan => (
            <div key={plan.id} className="p-3.5 bg-slate-700/70 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-600/50 transition-colors">
              <div className="flex-grow">
                <p className="text-md font-semibold text-teal-300">{plan.name}</p>
                <p className="text-xs text-slate-400">For: {formatISODateForDisplay(plan.date, 'short')} at {TIME_SLOTS.find(t => t.value === plan.time)?.label || plan.time}</p>
                <p className="text-xs text-slate-500">Saved: {formatISODateForDisplay(plan.createdAt.substring(0,10), 'short')}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0 self-start sm:self-center">
                <button onClick={() => onLoadPlan(plan.id)} className="flex items-center px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium" aria-label={`Load plan ${plan.name}`}>
                  <EyeIcon className="w-4 h-4 mr-1" /> Load
                </button>
                <button onClick={() => handleDeleteSavedPlan(plan.id)} className="flex items-center px-3 py-1.5 text-xs bg-red-700 hover:bg-red-600 text-white rounded-md font-medium" aria-label={`Delete plan ${plan.name}`}>
                  <TrashIcon className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Re-import TIME_SLOTS if it was removed or not accessible. For safety, ensure it's available.
import { TIME_SLOTS } from '../constants';
