import React from 'react';

interface AvatarProps {
  username: string;
  avatarColor?: string; // e.g., "bg-blue-500"
  size?: 'small' | 'medium' | 'large';
}

// Simple hash function to generate a color if not provided
const generateColorFromUsername = (username: string): string => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({ username, avatarColor, size = 'medium' }) => {
  const firstLetter = username ? username.charAt(0).toUpperCase() : '?';
  const bgColor = avatarColor || generateColorFromUsername(username || "Unknown");

  let sizeClasses = '';
  let textSizeClass = '';
  switch (size) {
    case 'small':
      sizeClasses = 'w-8 h-8';
      textSizeClass = 'text-sm';
      break;
    case 'large':
      sizeClasses = 'w-16 h-16';
      textSizeClass = 'text-2xl';
      break;
    case 'medium':
    default:
      sizeClasses = 'w-10 h-10';
      textSizeClass = 'text-lg';
      break;
  }

  return (
    <div
      className={`flex-shrink-0 ${sizeClasses} rounded-full flex items-center justify-center text-white font-semibold ${bgColor} shadow-md`}
      title={username}
    >
      <span className={textSizeClass}>{firstLetter}</span>
    </div>
  );
};