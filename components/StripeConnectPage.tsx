import React, { useState } from 'react';

interface StripeConnectPageProps {
  onConnectSuccess: () => void;
  onCancel: () => void;
}

const StripeConnectPage: React.FC<StripeConnectPageProps> = ({ onConnectSuccess, onCancel }) => {
  const [email, setEmail] = useState('jenna.s@example.com');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    setError('');

    // In a real app, this would redirect to Stripe, then Stripe would redirect back.
    // Here, we just simulate the successful return.
    onConnectSuccess();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 text-center">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
             <img alt="Stripe logo" src="https://stripe.com/img/v3/home/social.png" className="w-12 h-12 rounded-md"/>
          </div>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">PartnerFlow is requesting to connect to your Stripe account.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">Connect with Stripe</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Enter your email to connect your account for payouts.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="stripe-email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                id="stripe-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                By clicking "Authorize", you agree to allow PartnerFlow to access your Stripe account information for the purpose of processing affiliate payouts.
            </p>
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Authorize access to your account
            </button>
             <button
              type="button"
              onClick={onCancel}
              className="w-full mt-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500"
            >
              Cancel and return to PartnerFlow
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StripeConnectPage;