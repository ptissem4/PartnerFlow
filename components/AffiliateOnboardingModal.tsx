import React, { useState } from 'react';
import { User } from '../data/mockData';

interface AffiliateOnboardingModalProps {
  affiliate: User;
  onComplete: () => void;
  onSkip: () => void;
}

const AffiliateOnboardingModal: React.FC<AffiliateOnboardingModalProps> = ({ affiliate, onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const nextStep = () => {
        setStep(s => Math.min(s + 1, totalSteps + 1));
    };

    const handleComplete = () => {
        onComplete();
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome, {affiliate.name.split(' ')[0]}!</h3>
                        <p className="text-gray-600 dark:text-gray-300">Let's quickly show you how to get started.</p>
                    </>
                );
            case 2:
                return (
                     <>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">1. Get Your Referral Link</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Your most important tool! Select a product from the list to generate your unique link to share.</p>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                           <img src="https://i.imgur.com/y1v2Y0Q.png" alt="Example of getting a referral link" className="rounded-md shadow-md" />
                        </div>
                    </>
                );
            case 3:
                return (
                     <>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">2. Find Marketing Resources</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Your partner provides images, email templates, and more to help you succeed. Find them under "Marketing Resources" once you select a product.</p>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                           <img src="https://i.imgur.com/9aJ4n2x.png" alt="Example of marketing resources" className="rounded-md shadow-md" />
                        </div>
                    </>
                );
            case 4:
                 return (
                    <>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">You're Ready to Promote!</h3>
                        <p className="text-gray-600 dark:text-gray-300">That's it! Start sharing your links and track your performance right here in your dashboard.</p>
                    </>
                );
            default:
                return null;
        }
    };

    const renderButtons = () => {
        switch(step) {
            case 1:
            case 2:
            case 3:
                return <button onClick={nextStep} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Next</button>;
            case 4:
                return <button onClick={handleComplete} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Explore Dashboard</button>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onSkip}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 sm:p-8 transform transition-all relative" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <button
                onClick={onSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close onboarding"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="min-h-[250px] flex flex-col justify-center text-center">
                {renderStepContent()}
            </div>
            <div className="flex items-center justify-between mt-6">
                <button onClick={onSkip} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline">
                    Skip
                </button>
                 <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`h-2 w-4 rounded-full transition-colors ${step > i ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        ))}
                    </div>
                    {renderButtons()}
                </div>
            </div>
          </div>
        </div>
    );
};

export default AffiliateOnboardingModal;