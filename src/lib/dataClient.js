import { createClient } from '@supabase/supabase-js';
import { createLocalAdapter } from './localAdapter';
import { createSupabaseAdapter } from './supabaseAdapter';

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

/**
 * When no Supabase credentials are configured the app runs on the in-browser
 * demo backend so the full flow can be demonstrated offline.
 */
export const isDemoMode = !url || !key;

const client = isDemoMode
  ? null
  : createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // The app uses email/password only, so there is no OAuth redirect to parse.
        detectSessionInUrl: false,
      },
    });

export const dataClient = isDemoMode ? createLocalAdapter() : createSupabaseAdapter(client);
