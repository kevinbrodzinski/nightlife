import React, { useState } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { BellIcon } from './icons/BellIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { IdentificationIcon } from './icons/IdentificationIcon'; 
import { PencilIcon } from './icons/PencilIcon'; 
import { DocumentTextIcon } from './icons/DocumentTextIcon'; // For terms/privacy

// Context Hooks
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlanner } from '../contexts/PlannerContext'; 
import { useToast } from '../contexts/ToastContext'; 
import { useUser } from '../contexts/UserContext'; 

interface SettingsPageProps {
  globalNotificationsEnabled: boolean; 
  onToggleGlobalNotifications: () => void; 
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionElement?: React.ReactNode; 
  onClick?: () => void; 
  isDestructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, actionElement, onClick, isDestructive }) => {
  const baseClasses = "flex items-center justify-between p-4 rounded-lg transition-colors duration-150";
  const clickableClasses = onClick ? "hover:bg-slate-700 cursor-pointer" : "";
  const titleColor = isDestructive ? "text-red-400" : "text-slate-100";
  return (<div className={`${baseClasses} ${clickableClasses} bg-slate-800`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick()} : undefined}><div className="flex items-center"><div className={`mr-4 p-2 rounded-full ${isDestructive ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>{icon}</div><div><h3 className={`text-md font-medium ${titleColor}`}>{title}</h3>{description && <p className="text-xs text-slate-400">{description}</p>}</div></div>{actionElement && <div className="ml-4 flex-shrink-0">{actionElement}</div>}</div>);
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  globalNotificationsEnabled,
  onToggleGlobalNotifications,
}) => {
  const { handleClearAllFavorites } = useFavorites();
  const { clearAllSavedPlans } = usePlanner(); 
  const { showToast } = useToast(); // showToast might not be needed directly here if contexts handle their own toasts
  const { currentUserProfile, openProfileModal, signOut } = useUser(); 

  const [isClearFavoritesModalOpen, setIsClearFavoritesModalOpen] = useState(false);
  const [isClearPlansModalOpen, setIsClearPlansModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);


  const handleConfirmClearFavorites = () => {
    handleClearAllFavorites(); 
    setIsClearFavoritesModalOpen(false);
  };

  const handleConfirmClearPlans = () => {
    clearAllSavedPlans(); 
    setIsClearPlansModalOpen(false);
  };

  const handleConfirmSignOut = () => {
    signOut(); // Call signOut from UserContext
    setIsSignOutModalOpen(false);
  };

  return (
    <div className="animate-fadeIn p-0 md:p-2 space-y-8">
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Profile</h3>
        <div className="space-y-2">
          <SettingItem 
            icon={<IdentificationIcon className="w-5 h-5" />} 
            title="Username" 
            description={currentUserProfile?.username || "Not Set"}
            onClick={openProfileModal}
            actionElement={<PencilIcon className="w-4 h-4 text-slate-400 hover:text-slate-200" />}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Notifications</h3>
        <div className="space-y-2">
          <SettingItem 
            icon={<BellIcon className="w-5 h-5" />} 
            title="Global Busy Alerts" 
            description="Receive alerts when your favorite venues get busy." 
            actionElement={
                <button 
                    onClick={onToggleGlobalNotifications} 
                    aria-pressed={globalNotificationsEnabled} 
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${globalNotificationsEnabled ? 'bg-teal-600 focus:ring-teal-500' : 'bg-slate-600 focus:ring-slate-500'}`}
                >
                    <span className="sr-only">Toggle global notifications</span>
                    <span aria-hidden="true" className={`${globalNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}/>
                </button>
            } 
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Data Management</h3>
        <div className="space-y-2">
            <SettingItem 
                icon={<TrashIcon className="w-5 h-5" />} 
                title="Clear All Favorite Venues" 
                description="Removes all your general favorited venues." 
                onClick={() => setIsClearFavoritesModalOpen(true)}
                isDestructive
            />
            <SettingItem 
                icon={<TrashIcon className="w-5 h-5" />} 
                title="Clear All Saved Plans" 
                description="Deletes all your saved night plans." 
                onClick={() => setIsClearPlansModalOpen(true)}
                isDestructive
            />
            {/* Add Clear Cache if implemented */}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Legal</h3>
        <div className="space-y-2">
            <SettingItem icon={<DocumentTextIcon className="w-5 h-5" />} title="Terms of Service" onClick={() => alert("View Terms (Placeholder)")} />
            <SettingItem icon={<ShieldCheckIcon className="w-5 h-5" />} title="Privacy Policy" onClick={() => alert("View Privacy Policy (Placeholder)")} />
        </div>
      </section>
      
       <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Account Actions</h3>
        <div className="space-y-2">
            <SettingItem 
                icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />} 
                title="Sign Out" 
                onClick={() => setIsSignOutModalOpen(true)}
                isDestructive
            />
        </div>
      </section>

      <ConfirmationModal
        isOpen={isClearFavoritesModalOpen}
        onClose={() => setIsClearFavoritesModalOpen(false)}
        onConfirm={handleConfirmClearFavorites}
        title="Clear All Favorites?"
        message="Are you sure you want to remove all your general favorite venues? This action cannot be undone."
        confirmButtonText="Clear Favorites"
        isDestructiveAction
      />
      <ConfirmationModal
        isOpen={isClearPlansModalOpen}
        onClose={() => setIsClearPlansModalOpen(false)}
        onConfirm={handleConfirmClearPlans}
        title="Clear All Saved Plans?"
        message="Are you sure you want to delete all your saved night plans? This action cannot be undone."
        confirmButtonText="Clear Plans"
        isDestructiveAction
      />
      <ConfirmationModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        title="Sign Out?"
        message="Are you sure you want to sign out? Your profile will be cleared from this device."
        confirmButtonText="Sign Out"
        isDestructiveAction
      />
    </div>
  );
};