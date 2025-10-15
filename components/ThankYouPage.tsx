import React, { useEffect, useState } from 'react';

// Function to read a cookie, will be needed inside the component
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

interface ThankYouPageProps {
    onNavigateHome: () => void;
    onTrackSale: (referralCode: string, saleDetails: { productId: string, amount: number }) => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigateHome, onTrackSale }) => {
    const [tracked, setTracked] = useState(false);

    useEffect(() => {
        // This effect simulates the tracking pixel firing on page load.
        if (!tracked) {
            const referralCode = getCookie('partnerflow_ref');
            
            // In a real scenario, this data would be populated by the e-commerce platform.
            const saleDetails = {
                productId: '1', // Hardcoded for demo: Ultimate Productivity Course
                amount: 499,
            };

            if (referralCode) {
                onTrackSale(referralCode, saleDetails);
                
                // Clear the cookie after tracking
                document.cookie = "partnerflow_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
            setTracked(true);
        }
    }, [onTrackSale, tracked]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
            <div className="flex flex-col items-center max-w-lg">
                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Thank You for Your Purchase!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Your order has been confirmed. You will receive an email shortly with your access details.
                </p>
                <div className="p-4 border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-left my-4 rounded-r-lg">
                    <h4 className="font-bold text-gray-800 dark:text-white">Note for Creator (Demo)</h4>
                    <p className="text-sm text-cyan-700 dark:text-cyan-200 mt-1">
                        An affiliate referral was just detected and the sale has been automatically attributed in your PartnerFlow dashboard.
                    </p>
                </div>
                <button
                    onClick={onNavigateHome}
                    className="mt-6 flex items-center px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ThankYouPage;
