

import { createClient } from '@supabase/supabase-js';

// FIX: Corrected environment variable access for Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Please set the VITE_SUPABASE_URL environment variable.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase anonymous key is missing. Please set the VITE_SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);