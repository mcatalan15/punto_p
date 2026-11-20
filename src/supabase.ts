import { createClient } from '@supabase/supabase-js';

// Which database to use is decided by the env file Vite loads:
//   npm run dev     -> .env.development  (your DEV project)
//   npm run build   -> .env.production   (the LIVE project)
// Both keys are the *publishable* key, which is safe in client code.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

if (!url || !key || url.startsWith('YOUR_') || key.startsWith('YOUR_')) {
  throw new Error(
    'Supabase no está configurado para este entorno. ' +
      'Revisa .env.development (local) o .env.production (deploy) y pon la URL y la publishable key del proyecto.',
  );
}

export const supabase = createClient(url, key);

export type Category = {
  id: number;
  name: string;
  position: number;
};

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  ingredients: string | null;
  price: number;
  position: number;
  visible: boolean;
  created_at: string;
};
