
import React from 'react';
import { AppView } from '../src/App';

interface LoginSelectorProps {
  onSelect: (view: 'creator_login' | 'affiliate_login') => void;
}

const LoginSelector: React.FC<LoginSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg max-w-lg w-full">
        <div className="inline-flex items-center justify-center mb-6">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold ml-3 text-gray-800 dark:text-white">PartnerFlow</h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">How would you like to log in?</h2>
        <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button
                onClick={() => onSelect('creator_login')}
                className="flex-1 p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg transition-all text-left"
            >
                <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">I'm a Creator</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Log in to manage your affiliate program.</p>
            </button>
            <button
                onClick={() => onSelect('affiliate_login')}
                className="flex-1 p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg transition-all text-left"
            >
                <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">I'm an Affiliate</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Access your affiliate dashboard and links.</p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;