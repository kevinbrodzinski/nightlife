import React, { useState, useMemo } from 'react';
import { useFriends } from '../contexts/FriendsContext';
import { useUser } from '../contexts/UserContext';
import { Avatar } from './Avatar'; // New Avatar component
import { UserPlusSolidIcon } from './icons/UserPlusSolidIcon';
import { UserMinusSolidIcon } from './icons/UserMinusSolidIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { UserGroupIcon } from './icons/UserGroupIcon'; // For title

export const FriendsPage: React.FC = () => {
  const { friends, simulatedUsers, addFriend, removeFriend, isFriend } = useFriends();
  const { currentUserProfile } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const suggestedUsers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return simulatedUsers.filter(
      user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
        user.username !== currentUserProfile?.username &&
        !friends.includes(user.username)
    ).slice(0, 5); // Limit suggestions
  }, [searchTerm, simulatedUsers, friends, currentUserProfile]);

  const currentFriendsDetails = useMemo(() => {
    return friends.map(friendUsername => 
        simulatedUsers.find(su => su.username === friendUsername) || { username: friendUsername, avatarColor: 'bg-slate-500' }
    ).sort((a,b) => a.username.localeCompare(b.username));
  }, [friends, simulatedUsers]);


  return (
    <div className="p-4 md:p-6 space-y-8 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-400 mb-2 flex items-center justify-center">
          <UserGroupIcon className="w-8 h-8 mr-3 text-teal-400" /> Friends
        </h1>
        <p className="text-slate-400">Connect with friends and plan your nights out together.</p>
      </div>

      {/* Search / Add Friends Section */}
      <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl">
        <h2 className="text-xl font-semibold text-sky-300 mb-3">Find New Friends</h2>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
          />
        </div>
        {searchTerm.trim() && suggestedUsers.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-3">No users found matching "{searchTerm}".</p>
        )}
        {suggestedUsers.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-1">
            {suggestedUsers.map(user => (
              <div key={user.username} className="flex items-center justify-between p-2.5 bg-slate-700/70 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar username={user.username} avatarColor={user.avatarColor} />
                  <span className="text-sm font-medium text-slate-200">{user.username}</span>
                </div>
                <button
                  onClick={() => addFriend(user.username)}
                  className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md transition-colors"
                  aria-label={`Add ${user.username} as friend`}
                >
                  <UserPlusSolidIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Friends List Section */}
      <div className="p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl">
        <h2 className="text-xl font-semibold text-sky-300 mb-3">Your Friends ({currentFriendsDetails.length})</h2>
        {currentFriendsDetails.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            You haven't added any friends yet. Use the search above to find them!
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-1">
            {currentFriendsDetails.map(friend => (
              <div key={friend.username} className="flex items-center justify-between p-2.5 bg-slate-700/70 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar username={friend.username} avatarColor={friend.avatarColor} />
                  <span className="text-sm font-medium text-slate-200">{friend.username}</span>
                </div>
                <button
                  onClick={() => removeFriend(friend.username)}
                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
                  aria-label={`Remove ${friend.username} from friends`}
                >
                  <UserMinusSolidIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};