
import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// Please replace these placeholder values with your actual Supabase project URL and Anon Key.
// You can find these in your Supabase project's dashboard under "Settings" > "API".
const supabaseUrl = 'https://ucaplitxtjwqyndncdkv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYXBsaXR4dGp3cXluZG5jZGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjcwOTQsImV4cCI6MjA3NDEwMzA5NH0.IWhl_ctEPKJ0z8wt_S4Up4NCTZcdcmXtM12_Fl3T6pw';

// The Supabase client will throw its own error if the URL or key is invalid.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
