
import React, { useState } from 'react';
import { Plan } from '../data/mockData';

interface CheckoutPageProps {
    plan: Plan;
    cycle: 'monthly' | 'annual';
    onSuccess: () => void;
    onCancel: () => void;
    userEmail: string;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ plan, cycle, onSuccess, onCancel, userEmail }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const price = cycle === 'annual' ? plan.annualPrice : plan.price;
    const priceDisplay = cycle === 'annual' ? `$${price}/year` : `$${plan.price}/month`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            onSuccess();
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-lg order-last lg:order-first">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white">{plan.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{cycle === 'annual' ? 'Billed Annually' : 'Billed Monthly'}</p>
                            </div>
                            <p className="font-semibold text-gray-800 dark:text-white">{priceDisplay}</p>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-white pt-4">
                            <p>Total</p>
                            <p>${price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Subscribe to {plan.name}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" id="email" readOnly value={userEmail} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                            <input type="text" id="card-number" placeholder="•••• •••• •••• 4242" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                                <input type="text" id="expiry-date" placeholder="MM / YY" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                                <input type="text" id="cvc" placeholder="123" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                         <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {isProcessing && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isProcessing ? 'Processing...' : `Pay $${price.toFixed(2)}`}
                            </button>
                            <button type="button" onClick={onCancel} className="w-full mt-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
