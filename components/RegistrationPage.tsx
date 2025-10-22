import React, { useState } from 'react';

interface RegistrationPageProps {
  onSignup: (name: string, companyName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleSignIn: () => void;
  onBack: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onSignup, onGoogleSignIn, onBack }) => {
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
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">OR</span>
                </div>
            </div>

            <div>
                <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900"
                >
                    <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Sign up with Google
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