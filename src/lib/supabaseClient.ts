
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent crashing in browser environments.
const safeProcessEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
const supabaseUrl = safeProcessEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = safeProcessEnv.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl) {
  console.warn("Supabase URL is not set. The application will run in demo mode.");
}

if (!supabaseAnonKey) {
  console.warn("Supabase Anon Key is not set. The application will run in demo mode.");
}

// Provide dummy values when env vars are missing to prevent the client from throwing an error.
// The app's logic (useMockData) will prevent any actual calls from being made with these dummy credentials.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'dummy-key-for-local-development'
);