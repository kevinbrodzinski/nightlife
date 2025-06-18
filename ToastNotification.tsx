
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon'; // Will create this

interface ToastNotificationProps {
  id: number; // To handle re-triggering with same message
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ id, message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Trigger enter animation
    const timer = setTimeout(() => {
      setIsVisible(false); // Trigger leave animation
      // Wait for leave animation to complete before actually dismissing
      setTimeout(onDismiss, 300); // Corresponds to animation duration
    }, 3700); // Visible for 3.7s + 0.3s leave animation = 4s total

    return () => clearTimeout(timer);
  }, [id, onDismiss]); // Depend on id to reset timer if same message is re-triggered

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const iconColor = type === 'success' ? 'text-green-100' : 'text-red-100';
  const IconComponent = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
    >
      <div
        className={`flex items-center space-x-3 p-4 rounded-lg shadow-2xl text-white text-sm font-medium ${bgColor}`}
        role="alert"
        aria-live="assertive"
      >
        <IconComponent className={`w-6 h-6 ${iconColor}`} />
        <span>{message}</span>
        <button 
            onClick={() => { setIsVisible(false); setTimeout(onDismiss, 300); }} 
            className="ml-auto -mr-1 -my-1 p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/50"
            aria-label="Dismiss notification"
        >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </div>
  );
};
