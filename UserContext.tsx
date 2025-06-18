import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useMemo } from 'react';
import type { UserProfile } from '../types';
import { useToast } from './ToastContext';
import { ProfileSetupModal } from '../components/ProfileSetupModal';

interface UserContextType {
  currentUserProfile: UserProfile | null;
  updateUserProfile: (username: string) => void;
  isProfileSetupModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  signOut: () => void; // New: signOut function
  currentUserNameOrDefault: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_PROFILE_STORAGE_KEY = 'nightlifeFinderUserProfile';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(() => {
    const savedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentUserProfile && !localStorage.getItem(USER_PROFILE_STORAGE_KEY)) { // Check local storage too, to prevent modal on intended sign out
      setIsProfileSetupModalOpen(true); 
    }
  }, [currentUserProfile]);

  const updateUserProfile = useCallback((username: string) => {
    if (!username.trim()) {
      showToast("Username cannot be empty.", "error");
      return;
    }
    if (username.trim().length < 3) {
        showToast("Username must be at least 3 characters.", "error");
        return;
    }
    const newProfile: UserProfile = { username: username.trim() };
    setCurrentUserProfile(newProfile);
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    showToast("Profile updated successfully!", "success");
    setIsProfileSetupModalOpen(false);
  }, [showToast]);

  const openProfileModal = useCallback(() => setIsProfileSetupModalOpen(true), []);
  const closeProfileModal = useCallback(() => {
    // Only allow closing if it's not the initial setup
    if (currentUserProfile) {
        setIsProfileSetupModalOpen(false);
    } else {
        showToast("Please set up your username to continue.", "error");
    }
  }, [currentUserProfile, showToast]);
  
  const signOut = useCallback(() => {
    setCurrentUserProfile(null);
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    setIsProfileSetupModalOpen(true); // Re-open modal for new setup
    showToast("Signed out successfully.", "success");
  }, [showToast]);

  const currentUserNameOrDefault = useMemo(() => {
    return currentUserProfile?.username || "You";
  }, [currentUserProfile]);

  return (
    <UserContext.Provider value={{ 
        currentUserProfile, 
        updateUserProfile, 
        isProfileSetupModalOpen, 
        openProfileModal, 
        closeProfileModal,
        signOut, // Expose signOut
        currentUserNameOrDefault
    }}>
      {children}
      {isProfileSetupModalOpen && (
        <ProfileSetupModal
          isOpen={isProfileSetupModalOpen}
          onClose={closeProfileModal}
          currentUsername={currentUserProfile?.username}
          onSave={updateUserProfile}
          isInitialSetup={!currentUserProfile}
        />
      )}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};