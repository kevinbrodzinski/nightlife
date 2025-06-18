
import React from 'react';
import { WifiSlashIcon } from './icons/WifiSlashIcon';
import { Header } from './Header'; // Optional: include header for branding

export const OfflineNotice: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      {/* <Header /> You might want to include a simplified header or logo */}
      <div className="bg-slate-800 p-8 sm:p-12 rounded-xl shadow-2xl">
        <WifiSlashIcon className="mx-auto h-20 w-20 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-red-400 mb-3">You're Offline!</h1>
        <p className="text-slate-300 text-lg mb-2">
          Looks like you've lost your connection.
        </p>
        <p className="text-slate-400 text-md">
          Please check your internet and try again to find tonight’s hotspots.
        </p>
        {/* Optional: Add a retry button if your app has a manual refresh mechanism */}
        {/* <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
            Try Again
        </button> */}
      </div>
    </div>
  );
};
