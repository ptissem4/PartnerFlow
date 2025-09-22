import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucaplitxtjwqyndncdkv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYXBsaXR4dGp3cXluZG5jZGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjcwOTQsImV4cCI6MjA3NDEwMzA5NH0.IWhl_ctEPKJ0z8wt_S4Up4NCTZcdcmXtM12_Fl3T6pw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
