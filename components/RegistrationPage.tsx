import React, { useState } from 'react';

interface RegistrationPageProps {
  onSignup: (name: string, companyName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onSignup, onBack }) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if(password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }
    setError(null);
    setIsLoading(true);

    const result = await onSignup(name, companyName, email, password);
    if (!result.success) {
      setError(result.error || "An unknown error occurred during signup.");
    }
    // On success, the onAuthStateChange listener in App.tsx will handle navigation.
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold ml-3 text-gray-800 dark:text-white">PartnerFlow</h1>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Create your account</h2>
          <p className="text-gray-500 dark:text-gray-400">Start your 14-day free trial. No credit card required.</p>
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
           <div className="mb-4">
            <label htmlFor="companyName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="Your company or brand name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-4">
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
           <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
           <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Start Free Trial'}
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

export default RegistrationPage;