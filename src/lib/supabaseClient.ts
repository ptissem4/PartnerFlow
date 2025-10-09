
import { createClient } from '@supabase/supabase-js';

// The original code was throwing an error when these environment variables were not set,
// causing a white screen. We are now using placeholder values to allow the app to render.
// In a real production environment, these should be replaced with actual Supabase credentials
// via environment variables.
const supabaseUrl = window.process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = window.process.env.VITE_SUPABASE_ANON_KEY || 'placeholder.anon.key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn("Supabase URL is not set. Using a placeholder. The application will not connect to a database.");
}

if (supabaseAnonKey === 'placeholder.anon.key') {
  console.warn("Supabase Anon Key is not set. Using a placeholder. The application will not connect to a database.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);