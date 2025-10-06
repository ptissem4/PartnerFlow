

import React, { useState, useEffect } from 'react';
import { Theme, ActiveView } from '../src/App';
import { User, PlatformSettings } from '../data/mockData';

interface HeaderProps {
  title: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onMenuClick: () => void;
  currentUser: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  platformSettings: PlatformSettings;
  trialDaysRemaining: number | null;
  onUpgradeClick: () => void;
  onStartOnboarding: () => void;
  onboardingIncomplete: boolean;
}

const ThemeToggleButton: React.FC<{ theme: Theme; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-label="Toggle dark mode"
    >
        {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
    </button>
);

const ViewSwitcher: React.FC<{ activeView: ActiveView; setActiveView: (view: ActiveView) => void; }> = ({ activeView, setActiveView }) => {
    return (
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-sm font-medium">
            <button
                onClick={() => setActiveView('creator')}
                className={`px-3 py-1 rounded-full transition-colors ${activeView === 'creator' ? 'bg-white dark:bg-gray-800 shadow text-cyan-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
                Creator
            </button>
            <button
                onClick={() => setActiveView('affiliate')}
                className={`px-3 py-1 rounded-full transition-colors ${activeView === 'affiliate' ? 'bg-white dark:bg-gray-800 shadow text-cyan-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
                Affiliate
            </button>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ title, theme, setTheme, onMenuClick, currentUser, activeView, setActiveView, onLogout, platformSettings, trialDaysRemaining, onUpgradeClick, onStartOnboarding, onboardingIncomplete }) => {
    const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(false);
    
    useEffect(() => {
        const isDismissed = sessionStorage.getItem('announcementDismissed') === 'true';
        const shouldBeVisible = platformSettings.announcement.isEnabled && !isDismissed;
        setIsAnnouncementVisible(shouldBeVisible);
    }, [platformSettings]);

    const handleDismissAnnouncement = () => {
        sessionStorage.setItem('announcementDismissed', 'true');
        setIsAnnouncementVisible(false);
    };

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };
    
    const isSuperAdmin = currentUser.roles.includes('super_admin');
    const canSwitchView = currentUser.roles.includes('creator') && currentUser.roles.includes('affiliate');

  return (
    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {isAnnouncementVisible && !isSuperAdmin && (
            <div className="bg-cyan-500 text-white text-sm font-medium p-2 text-center relative">
                <span>{platformSettings.announcement.text}</span>
                <button onClick={handleDismissAnnouncement} className="absolute top-1/2 right-4 transform -translate-y-1/2">&times;</button>
            </div>
        )}
         {trialDaysRemaining !== null && trialDaysRemaining > 0 && !isSuperAdmin && (
            <div className="bg-yellow-400 text-yellow-900 text-sm font-medium p-2 text-center relative">
                <span>You have {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in your trial. <button onClick={onUpgradeClick} className="font-bold underline hover:text-yellow-950">Upgrade Now</button></span>
            </div>
        )}
        <header className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {(activeView === 'creator' || isSuperAdmin) && (
                <button
                className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden"
                onClick={onMenuClick}
                aria-label="Open sidebar"
                >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                </button>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white ml-4 md:ml-0">{title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            {onboardingIncomplete && !isSuperAdmin && (
                <button 
                    onClick={onStartOnboarding}
                    className="px-4 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 animate-pulse"
                >
                    Complete Setup
                </button>
            )}
            {canSwitchView && !isSuperAdmin && <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />}
            <ThemeToggleButton theme={theme} toggleTheme={handleThemeToggle} />
            <button onClick={onLogout} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500">
                Logout
            </button>
            <div className="w-10 h-10">
              <img
                className="w-full h-full rounded-full object-cover"
                src={currentUser.avatar}
                alt="User avatar"
              />
            </div>
          </div>
        </header>
    </div>
  );
};

export default Header;