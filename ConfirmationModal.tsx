import React, { useEffect, useCallback } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDestructiveAction?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  isDestructiveAction = false,
}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
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

  const confirmButtonClasses = isDestructiveAction
    ? "bg-red-600 hover:bg-red-500 focus:ring-red-400"
    : "bg-teal-600 hover:bg-teal-500 focus:ring-teal-400";

  return (
    <div 
        className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        onClick={onClose} // Close on overlay click
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all duration-300 ease-out"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="confirmation-modal-title" className={`text-xl font-semibold ${isDestructiveAction ? 'text-red-400' : 'text-sky-400'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 -m-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close confirmation"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white rounded-md transition-colors shadow-md focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-offset-slate-800 ${confirmButtonClasses}`}
          >
            {confirmButtonText}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {cancelButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
