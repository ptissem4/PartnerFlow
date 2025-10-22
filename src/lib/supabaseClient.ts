import { createClient } from '@supabase/supabase-js';

// In a Vite environment (indicated by VITE_ prefix), environment variables are exposed on import.meta.env
// FIX: Add optional chaining `?.` to prevent crash if `import.meta.env` is not available.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl) {
  console.warn("L'URL Supabase n'est pas définie. L'application fonctionnera en mode démo.");
}

if (!supabaseAnonKey) {
  console.warn("La clé anonyme Supabase n'est pas définie. L'application fonctionnera en mode démo.");
}

// Provide dummy values when environment variables are missing to prevent the client from throwing an error.
// The application logic (useMockData) will prevent any real requests from being made with these dummy credentials.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'dummy-key-for-local-development'
);