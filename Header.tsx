
import React from 'react';
import type { HeaderProps } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon'; // New
import { CogSolidIcon } from './icons/CogSolidIcon'; // New

export const Header: React.FC<HeaderProps> = ({
  appTitle,
  currentOverlay,
  pageTitle,
  onBackClick,
  onSettingsClick,
}) => {
  const displayTitle = currentOverlay ? pageTitle : appTitle;
  const showBackButton = currentOverlay !== null;

  return (
    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md py-4 sm:py-5 px-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-12">
        <div className="flex-1 min-w-0">
          {showBackButton && (
            <button
              onClick={onBackClick}
              aria-label="Go back"
              className="p-2 -ml-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex-1 text-center min-w-0 px-2">
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 truncate">
            {displayTitle || appTitle}
          </h1>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onSettingsClick}
            aria-label="Open settings"
            className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <CogSolidIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
       {/* Sub-header for app description on main views, if desired */}
      {!currentOverlay && ( // Show only if no overlay is active, and for specific bnb tabs if needed
         <p className="text-center mt-1 text-sm text-slate-400 hidden sm:block">
            Discover the pulse of the city, one hotspot at a time.
        </p>
      )}
    </header>
  );
};
