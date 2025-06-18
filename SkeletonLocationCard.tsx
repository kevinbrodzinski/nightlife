
import React from 'react';

export const SkeletonLocationCard: React.FC = () => {
  return (
    <article 
      className="bg-slate-800 rounded-lg shadow-lg border-l-4 border-slate-700 overflow-hidden flex flex-col md:flex-row animate-pulse"
      aria-label="Loading venue data"
    >
      <div className="md:w-1/3 h-48 md:h-auto bg-slate-700"></div>
      <div className="p-5 md:p-6 flex-1 space-y-4">
        <div className="h-6 bg-slate-700 rounded w-3/4"></div> {/* Title */}
        <div className="h-4 bg-slate-700 rounded w-1/2"></div> {/* Category */}
        <div className="h-3 bg-slate-700 rounded w-1/3"></div> {/* Distance placeholder */}
        <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div> {/* Description line 1 */}
            <div className="h-3 bg-slate-700 rounded w-5/6"></div> {/* Description line 2 */}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
            <div className="h-6 w-20 bg-slate-700 rounded-full"></div> {/* Tag placeholder */}
            <div className="h-6 w-24 bg-slate-700 rounded-full"></div> {/* Tag placeholder */}
        </div>
      </div>
    </article>
  );
};
