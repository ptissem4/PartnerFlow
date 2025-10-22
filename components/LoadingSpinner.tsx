import React from 'react';

const LoadingSpinner: React.FC<{ fullPage?: boolean }> = ({ fullPage = false }) => {
    const spinner = (
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
    );

    if (fullPage) {
        return (
            <div className="flex justify-center items-center h-screen w-screen bg-gray-100 dark:bg-gray-900">
                {spinner}
            </div>
        );
    }
    return spinner;
};

export default LoadingSpinner;