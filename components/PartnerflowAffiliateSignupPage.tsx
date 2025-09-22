import React, { useState } from 'react';

interface PartnerflowAffiliateSignupPageProps {
  onSignup: (name: string, email: string) => void;
  onBack: () => void;
}

const PartnerflowAffiliateSignupPage: React.FC<PartnerflowAffiliateSignupPageProps> = ({ onSignup, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      onSignup(name, email);
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };
  
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
            Your application to join the PartnerFlow affiliate program is now pending approval. You will receive an email once it has been reviewed.
          </p>
          <button onClick={onBack} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-800">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
            <div className="inline-block p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Become a PartnerFlow Affiliate</h2>
            <p className="text-gray-500 dark:text-gray-400">Earn a recurring 30% commission for every customer you refer.</p>
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
            &larr; Return to login
          </button>
        </p>
      </div>
    </div>
  );
};

export default PartnerflowAffiliateSignupPage;