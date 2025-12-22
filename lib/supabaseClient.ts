import { createClient } from "@supabase/supabase-js";

// Récupérer les variables d'environnement avec des valeurs par défaut pour éviter les erreurs de build
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder";

// Créer le client Supabase
// Pendant le build, les valeurs placeholder seront utilisées mais ne causeront pas d'erreur
// En production, les vraies variables d'environnement seront utilisées
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


