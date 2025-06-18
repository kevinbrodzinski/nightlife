
import React, { useState, useEffect, useCallback } from 'react';
import type { DayOption, SavedDayVenue } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { CalendarPlusIcon } from './icons/CalendarPlusIcon';
import { BookmarkSlashIcon } from './icons/BookmarkSlashIcon';

interface SaveForDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
  daysOfWeekOptions: DayOption[];
  onSaveVenueForDay: (dayOfWeek: string, notes: string) => void;
  getVenueSaveDetailsForDay: (dayOfWeek: string) => SavedDayVenue | undefined;
}

export const SaveForDayModal: React.FC<SaveForDayModalProps> = ({
  isOpen,
  onClose,
  venueId,
  venueName,
  daysOfWeekOptions,
  onSaveVenueForDay,
  getVenueSaveDetailsForDay,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(daysOfWeekOptions[0]?.value || '');
  const [notes, setNotes] = useState<string>('');
  const [currentSaveDetails, setCurrentSaveDetails] = useState<SavedDayVenue | undefined>(undefined);

  useEffect(() => {
    if (isOpen && selectedDay) {
      const details = getVenueSaveDetailsForDay(selectedDay);
      setCurrentSaveDetails(details);
      setNotes(details?.notes || '');
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedDay(daysOfWeekOptions[0]?.value || '');
      setNotes('');
      setCurrentSaveDetails(undefined);
    }
  }, [isOpen, selectedDay, venueId, getVenueSaveDetailsForDay, daysOfWeekOptions]);

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(event.target.value);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value);
  };

  const handleSave = () => {
    onSaveVenueForDay(selectedDay, notes);
    // Optionally close modal after save, or allow multiple saves/edits
    // onClose(); 
  };
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

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
      className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-for-day-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all duration-300 ease-out"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="save-for-day-modal-title" className="text-xl font-semibold text-sky-400">
            Save "{venueName}" for a Specific Day
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 -m-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="dayOfWeekSelect" className="block text-sm font-medium text-slate-300 mb-1">
              Day of the Week
            </label>
            <select
              id="dayOfWeekSelect"
              value={selectedDay}
              onChange={handleDayChange}
              className="block w-full py-2.5 px-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
            >
              {daysOfWeekOptions.map(day => (
                <option key={day.value} value={day.value} className="bg-slate-700 text-slate-100">
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dayNotes" className="block text-sm font-medium text-slate-300 mb-1">
              Notes for {selectedDay} (optional)
            </label>
            <textarea
              id="dayNotes"
              value={notes}
              onChange={handleNotesChange}
              rows={3}
              placeholder={`e.g., Good for happy hour on ${selectedDay}s, live music at 9 PM...`}
              className="block w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            <CalendarPlusIcon className="w-5 h-5 mr-2" />
            {currentSaveDetails ? `Update for ${selectedDay}` : `Save for ${selectedDay}`}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Done
          </button>
        </div>
        {currentSaveDetails && (
            <p className="text-xs text-slate-500 mt-3 text-center sm:text-left">
                Last saved for {selectedDay}: {new Date(currentSaveDetails.savedAt).toLocaleDateString()}
            </p>
        )}
      </div>
    </div>
  );
};
