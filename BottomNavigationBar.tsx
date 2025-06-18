
import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { MapIcon } from './icons/MapIcon';
import { HeartIcon as HeartIconOutline } from './icons/HeartIconOutline';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { UserGroupSolidIcon } from './icons/UserGroupSolidIcon'; // New icon
import type { ActiveBNBTab } from '../types';

interface BottomNavigationBarProps {
  activeBNBTab: ActiveBNBTab;
  setActiveBNBTab: (tab: ActiveBNBTab) => void;
  favoriteCount: number;
}

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick, badgeCount }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 p-2 transition-colors duration-200 ease-in-out focus:outline-none relative ${
        isActive ? 'text-teal-400' : 'text-slate-400 hover:text-teal-300'
      }`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
    >
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-0 right-1/2 translate-x-[calc(50%+8px)] sm:translate-x-[calc(50%+10px)] bg-red-500 text-white text-xs rounded-full h-4 w-4 min-w-[1rem] flex items-center justify-center p-0.5">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      <div className={`w-5 h-5 sm:w-6 sm:h-6 mb-0.5 ${isActive ? 'transform scale-110' : ''}`}>{icon}</div>
      <span className={`text-[0.6rem] sm:text-xs font-medium ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>{label}</span>
       {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-1 bg-teal-400 rounded-t-full"></div>
      )}
    </button>
  );
};

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ activeBNBTab, setActiveBNBTab, favoriteCount }) => {
  const navItems: Array<Omit<NavItemProps, 'isActive' | 'onClick'> & { id: ActiveBNBTab }> = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'map', label: 'Map', icon: <MapIcon /> },
    { id: 'feed', label: 'Feed', icon: <NewspaperIcon /> },
    { id: 'planner', label: 'Planner', icon: <ClipboardDocumentListIcon /> },
    { id: 'friends', label: 'Friends', icon: <UserGroupSolidIcon /> }, // New "Friends" tab
    { id: 'favorites', label: 'Favorites', icon: <HeartIconOutline />, badgeCount: favoriteCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-800 border-t border-slate-700 shadow-top-md z-30 flex justify-around items-center">
      {navItems.map(item => (
        <NavItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          isActive={activeBNBTab === item.id}
          onClick={() => setActiveBNBTab(item.id)}
          badgeCount={item.badgeCount}
        />
      ))}
    </nav>
  );
};