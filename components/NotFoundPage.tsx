
import React from 'react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <div className="flex flex-col items-center">
        <h1 className="text-8xl font-extrabold text-cyan-500 mb-2">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or does not exist.
        </p>
        <button
          onClick={onNavigateHome}
          className="flex items-center px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
