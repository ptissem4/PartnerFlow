import { createClient } from '@supabase/supabase-js';

// Accès sécurisé aux variables d'environnement pour éviter les plantages dans les navigateurs.
const safeProcessEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
const supabaseUrl = safeProcessEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = safeProcessEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn("L'URL de Supabase n'est pas définie. L'application s'exécutera en mode démo.");
}

if (!supabaseAnonKey) {
  console.warn("La clé anonyme de Supabase n'est pas définie. L'application s'exécutera en mode démo.");
}

// Fournir des valeurs factices lorsque les variables d'environnement sont manquantes pour empêcher le client de lever une erreur.
// La logique de l'application (useMockData) empêchera toute requête réelle d'être effectuée avec ces informations d'identification factices.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'dummy-key-for-local-development'
);