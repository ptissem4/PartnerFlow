
import { createClient } from '@supabase/supabase-js';

// FIX: Replace import.meta.env with process.env to access environment variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Please set the VITE_SUPABASE_URL environment variable.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase anonymous key is missing. Please set the VITE_SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
