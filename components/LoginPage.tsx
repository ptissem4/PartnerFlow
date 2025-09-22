import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  onNavigateToRegister: () => void;
}

const demoUsers = [
    { email: 'admin@partnerflow.io', description: 'Super Admin' },
    { email: 'alex.doe@example.com', description: 'Creator (On Trial)' },
    { email: 'jenna.s@example.com', description: 'Creator & Affiliate' },
    { email: 'eva.gardner@example.com', description: 'Creator (Trial Expired)' },
    { email: 'onboarding.tester@example.com', description: 'Creator (Onboarding Demo)' },
    { email: 'elena.r@example.com', description: 'Affiliate' },
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }

    if (!password) {
        setError("Password is required.");
        return;
    }

    setIsLoading(true);
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || "Invalid login credentials. Please try again.");
    }
    // On success, the main App component's auth listener will redirect.
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
          <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Login to your account</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-6">
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
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

         <div className="text-center text-gray-500 text-sm space-y-2 mt-4">
            <p>
                Don't have an account?{' '}
                <button onClick={onNavigateToRegister} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    Sign up for a free trial
                </button>
            </p>
            <p>
                <button onClick={onBack} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    &larr; Back to Home Page
                </button>
            </p>
         </div>
      </div>

       <div className="w-full max-w-md mt-8 p-4 bg-white dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-center text-gray-700 dark:text-gray-300 mb-2">Demo Accounts</h3>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">Click an email to copy and paste. Use password: <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">password</code></p>
            <ul className="space-y-2 text-sm">
                {demoUsers.map(user => (
                    <li key={user.email} className="flex justify-between items-center">
                        <span 
                            onClick={() => {
                                navigator.clipboard.writeText(user.email);
                                setEmail(user.email);
                                setPassword('password');
                            }}
                            className="font-mono text-gray-600 dark:text-gray-400 cursor-pointer hover:text-cyan-500"
                            title="Click to copy email & enter demo password"
                        >
                            {user.email}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-right">
                           {user.description}
                        </span>
                    </li>
                ))}
            </ul>
        </div>

    </div>
  );
};

export default LoginPage;
