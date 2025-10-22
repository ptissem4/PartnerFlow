import React, { useState } from 'react';

interface AffiliateLoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onNavigateToMarketplace: () => void;
  onNavigateToSignup: () => void;
}

const AffiliateLoginPage: React.FC<AffiliateLoginPageProps> = ({ onLogin, onNavigateToMarketplace, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setIsLoading(true);
    const result = await onLogin(email, password);
    if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
    }
    // On success, App.tsx handles navigation.
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-800">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
            <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Affiliate Portal Login</h2>
            <p className="text-gray-500 dark:text-gray-400">Access your dashboard to track earnings and get resources.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Your email"
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
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
         <div className="text-center text-gray-500 text-sm space-y-2 mt-4">
            <p>
                Don't have an account?{' '}
                <button onClick={onNavigateToSignup} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    Sign up
                </button>
            </p>
            <p>
                <button onClick={onNavigateToMarketplace} className="font-medium text-gray-600 dark:text-gray-400 hover:underline text-xs">
                    or browse programs
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLoginPage;