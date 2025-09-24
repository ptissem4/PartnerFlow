import React, { useState } from 'react';
import { User } from '../data/mockData';

interface AffiliateSignupPageProps {
  onSignup: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  entrepreneur?: User;
}

const AffiliateSignupPage: React.FC<AffiliateSignupPageProps> = ({ onSignup, onBack, entrepreneur }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
        setError("Name and email are required.");
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }

    setError(null);
    setIsLoading(true);

    const result = await onSignup(name, email);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };

  if (!entrepreneur) {
     return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-800 text-center">
            <div>
                <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Invitation Link</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">This affiliate invitation link is either invalid or has expired.</p>
                <button onClick={onBack} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    &larr; Return to login selection
                </button>
            </div>
        </div>
     )
  }
  
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-900 shadow-2xl rounded-lg max-w-md w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your application to join the affiliate program for <strong>{entrepreneur.company_name}</strong> is now pending approval. You will receive an email once it has been reviewed.
          </p>
          <button onClick={onBack} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors">
            Return to Home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-800">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
            <img src={entrepreneur.avatar} alt={entrepreneur.company_name} className="w-20 h-20 rounded-full mx-auto mb-4"/>
          <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Join the {entrepreneur.company_name} Affiliate Program</h2>
          <p className="text-gray-500 dark:text-gray-400">Create your account to start earning.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Apply Now'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm">
          <button onClick={onBack} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
            &larr; Already have an account? Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default AffiliateSignupPage;