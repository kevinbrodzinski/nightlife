
import React from 'react';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon'; // Re-use existing icon

interface NoResultsProps {
  query?: string;
  onOpenFilterModal: () => void; // New prop for CTA
}

const SearchOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 4.5 15 15" />
  </svg>
);


export const NoResults: React.FC<NoResultsProps> = ({ query, onOpenFilterModal }) => {
  return (
    <div className="text-center py-12 px-6 bg-slate-800 rounded-xl shadow-lg animate-fadeIn">
      <SearchOffIcon className="mx-auto h-16 w-16 text-slate-500 mb-4" />
      <h3 className="text-2xl font-semibold text-slate-300 mb-2">No Vibes Found...</h3>
      {query ? (
        <p className="text-slate-400">
          We couldn't spot any hotspots matching "<span className="font-semibold text-teal-400">{query}</span>" with your current settings.
        </p>
      ) : (
        <p className="text-slate-400">
          No hotspots match your current filter settings.
        </p>
      )}
      <p className="text-slate-400 mt-2 mb-6">Maybe try a different search or adjust your filters?</p>
      <button
        onClick={onOpenFilterModal}
        className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
        Change Filters
      </button>
    </div>
  );
};
