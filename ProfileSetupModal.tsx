import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { UserCircleSolidIcon } from './icons/UserCircleSolidIcon'; 

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (username: string) => void;
  currentUsername?: string;
  isInitialSetup?: boolean;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUsername,
  isInitialSetup = false,
}) => {
  const [username, setUsername] = useState(currentUsername || '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || '');
      setError(null);
      // Focus the input field when modal opens for better UX
      setTimeout(() => inputRef.current?.focus(), 100); 
    }
  }, [isOpen, currentUsername]);

  const handleSave = () => {
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    setError(null);
    onSave(username.trim());
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !isInitialSetup) { // Only allow escape close if not initial setup
      onClose();
    } else if (event.key === 'Enter' && username.trim()) {
      handleSave();
    }
  }, [onClose, isInitialSetup, username, handleSave]); // Added handleSave to dependencies

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-setup-modal-title"
      onClick={isInitialSetup ? undefined : onClose} // Prevent close on overlay click for initial setup
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all duration-300 ease-out"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="profile-setup-modal-title" className="text-xl font-semibold text-sky-400 flex items-center">
            <UserCircleSolidIcon className="w-7 h-7 mr-2 text-sky-400" />
            {isInitialSetup ? "Set Up Your Profile" : "Edit Your Profile"}
          </h2>
          {!isInitialSetup && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 -m-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        <p className="text-slate-300 text-sm mb-1">
          Choose a username. This will be visible if you share plans with friends.
        </p>
        <p className="text-xs text-slate-500 mb-5">Minimum 3 characters.</p>


        <div>
          <label htmlFor="usernameInput" className="block text-sm font-medium text-slate-300 mb-1">
            Username
          </label>
          <input
            ref={inputRef}
            type="text"
            id="usernameInput"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            placeholder="e.g., NightOwl123"
            className={`block w-full py-2.5 px-3 bg-slate-700 border rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2  focus:border-teal-500 transition duration-150 ease-in-out ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-teal-500'}`}
            aria-describedby={error ? "username-error" : undefined}
          />
          {error && <p id="username-error" className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Save Profile
          </button>
          {!isInitialSetup && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};