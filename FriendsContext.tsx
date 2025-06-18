import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import type { UserProfile } from '../types';
import { useToast } from './ToastContext';
import { useUser } from './UserContext'; // To get current user's name

interface FriendsContextType {
  friends: string[]; // Array of friend usernames
  simulatedUsers: UserProfile[]; // For discovery
  addFriend: (username: string) => void;
  removeFriend: (username: string) => void;
  isFriend: (username: string) => boolean;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

const FRIENDS_STORAGE_KEY = 'nightlifeFinderFriends';

// Hardcoded list of simulated users for discovery.
// In a real app, these would come from a backend.
const SIMULATED_USERS_DATA: UserProfile[] = [
  { username: "NightOwlNina", avatarColor: "bg-pink-500" },
  { username: "PartyPete", avatarColor: "bg-indigo-500" },
  { username: "ChillCharlie", avatarColor: "bg-green-500" },
  { username: "RooftopRita", avatarColor: "bg-purple-500" },
  { username: "VenueValerie", avatarColor: "bg-orange-500" },
  { username: "GrooveGary", avatarColor: "bg-yellow-500" },
  { username: "SocialSam", avatarColor: "bg-red-500" },
  { username: "EventEric", avatarColor: "bg-cyan-500" },
];

export const FriendsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<string[]>(() => {
    const savedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);
    return savedFriends ? JSON.parse(savedFriends) : [];
  });
  const [simulatedUsers] = useState<UserProfile[]>(SIMULATED_USERS_DATA);
  const { showToast } = useToast();
  const { currentUserProfile } = useUser();

  useEffect(() => {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  }, [friends]);

  const addFriend = useCallback((usernameToAdd: string) => {
    if (currentUserProfile && usernameToAdd === currentUserProfile.username) {
      showToast("You can't add yourself as a friend!", "error");
      return;
    }
    if (friends.includes(usernameToAdd)) {
      showToast(`${usernameToAdd} is already your friend.`, "error");
      return;
    }
    const userExists = simulatedUsers.some(user => user.username === usernameToAdd);
    if (userExists) {
      setFriends(prevFriends => [...prevFriends, usernameToAdd]);
      showToast(`${usernameToAdd} added to your friends!`, "success");
    } else {
      showToast(`User "${usernameToAdd}" not found.`, "error");
    }
  }, [friends, simulatedUsers, showToast, currentUserProfile]);

  const removeFriend = useCallback((usernameToRemove: string) => {
    setFriends(prevFriends => prevFriends.filter(friend => friend !== usernameToRemove));
    showToast(`${usernameToRemove} removed from your friends.`, "success");
  }, [showToast]);

  const isFriend = useCallback((username: string): boolean => {
    return friends.includes(username);
  }, [friends]);

  return (
    <FriendsContext.Provider value={{ friends, simulatedUsers, addFriend, removeFriend, isFriend }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = (): FriendsContextType => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};