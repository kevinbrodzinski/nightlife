
import React from 'react';

interface SearchBarProps {
  activityQuery: string;
  setActivityQuery: (query: string) => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);


export const SearchBar: React.FC<SearchBarProps> = ({ activityQuery, setActivityQuery }) => {
  return (
    <div className="relative">
      <label htmlFor="activity-search" className="block text-sm font-medium text-slate-300 mb-1">
        What do you want to do tonight?
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="search"
          id="activity-search"
          name="activity-search"
          className="block w-full pl-10 pr-3 py-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
          placeholder="e.g., live music, rooftop bar, sports..."
          value={activityQuery}
          onChange={(e) => setActivityQuery(e.target.value)}
        />
      </div>
    </div>
  );
};