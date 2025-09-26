// FIX: Removed reference to 'vite/client' which was causing a type definition error.
// The project seems to be configured to use process.env instead of import.meta.env.

import { createClient } from '@supabase/supabase-js';

// FIX: Replaced import.meta.env with process.env to align with project conventions and fix TypeScript errors.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// FIX: Replaced import.meta.env with process.env to align with project conventions and fix TypeScript errors.
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Please set the VITE_SUPABASE_URL environment variable.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase anonymous key is missing. Please set the VITE_SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
