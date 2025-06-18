
import React from 'react';
import { LightBulbIcon } from './icons/LightBulbIcon'; 
import { XMarkIcon } from './icons/XMarkIcon';

interface WelcomeBannerProps {
  onDismiss: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss }) => {
  return (
    <div className="relative bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-4 sm:p-5 rounded-xl shadow-lg mb-6 text-white animate-fadeIn">
      <button
        onClick={onDismiss}
        aria-label="Dismiss welcome message"
        className="absolute top-2 right-2 p-1.5 text-sky-100 hover:text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">
          <LightBulbIcon className="w-8 h-8 text-yellow-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Welcome to the Hotspot Finder!</h3>
          <p className="text-sm text-sky-100 mt-1 leading-relaxed">
            Use the <strong className="font-medium">search bar</strong> or <strong className="font-medium">filters</strong> to find your perfect vibe.
            Or, tap "<strong className="font-medium">Hotspots Near Me Now</strong>" for instant suggestions!
          </p>
        </div>
      </div>
    </div>
  );
};
