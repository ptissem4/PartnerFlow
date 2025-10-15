import React, { useState, useEffect } from 'react';
import { Plan } from '../data/mockData';
import LoadingSpinner from './LoadingSpinner';

interface CheckoutPageProps {
    planToCheckout: { plan: Plan, cycle: 'monthly' | 'annual'} | null;
    onSuccess: () => Promise<void>;
    onReturnToApp: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ planToCheckout, onSuccess, onReturnToApp }) => {
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

    useEffect(() => {
        if (planToCheckout) {
            // Simulate the time it takes for the user to pay on Stripe
            // and for Stripe to send a webhook confirmation.
            const paymentSimulation = setTimeout(async () => {
                try {
                    await onSuccess();
                    setStatus('success');
                } catch (error) {
                    console.error("Payment processing failed:", error);
                    setStatus('failed');
                }
            }, 2500); // 2.5 second delay to simulate payment + webhook

            return () => clearTimeout(paymentSimulation);
        } else {
             // If no plan is selected somehow, show failure
            setStatus('failed');
        }
    }, [planToCheckout, onSuccess]);

    if (!planToCheckout) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">No plan was selected for checkout.</p>
                    <button onClick={onReturnToApp} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">Return to Billing</button>
                </div>
            </div>
        );
    }
    
    const { plan, cycle } = planToCheckout;
    const price = cycle === 'annual' ? plan.annualPrice : plan.price;

    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Processing Your Payment...</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">You are being redirected to our secure payment processor. Please wait.</p>
                        <LoadingSpinner />
                    </>
                );
            case 'success':
                return (
                    <>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            You have successfully subscribed to the <strong>{plan.name}</strong>. Welcome aboard!
                        </p>
                        <button onClick={onReturnToApp} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">
                            Go to my Dashboard &rarr;
                        </button>
                    </>
                );
            case 'failed':
                return (
                     <>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                             <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Payment Failed</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            There was an issue processing your payment. Please try again or contact support.
                        </p>
                        <button onClick={onReturnToApp} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">
                            Return to Billing
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default CheckoutPage;