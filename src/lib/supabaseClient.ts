

import { createClient } from '@supabase/supabase-js';

// Use the standard environment variable names without any prefixes.
const supabaseUrl = (process as any).env.SUPABASE_URL;
const supabaseAnonKey = (process as any).env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Please set the SUPABASE_URL environment variable.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase anonymous key is missing. Please set the SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);