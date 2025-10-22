import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent crashes in browsers.
const safeProcessEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
const supabaseUrl = safeProcessEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = safeProcessEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn("Supabase URL is not defined. The application will run in demo mode.");
}

if (!supabaseAnonKey) {
  console.warn("Supabase anonymous key is not defined. The application will run in demo mode.");
}

// Provide dummy values when environment variables are missing to prevent the client from throwing an error.
// The application logic (useMockData) will prevent any real requests from being made with these dummy credentials.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'dummy-key-for-local-development'
);
