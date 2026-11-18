import { createClient } from '@insforge/sdk';
import { createLocalAdapter } from './localAdapter';
import { createInsforgeAdapter } from './insforgeAdapter';

const baseUrl = (import.meta.env.VITE_INSFORGE_URL || '').trim();
const anonKey = (import.meta.env.VITE_INSFORGE_ANON_KEY || '').trim();

/**
 * When no InsForge credentials are configured the app runs on the in-browser
 * demo backend so the full flow can be demonstrated offline.
 */
export const isDemoMode = !baseUrl || !anonKey;

const client = isDemoMode ? null : createClient({ baseUrl, anonKey });

export const dataClient = isDemoMode ? createLocalAdapter() : createInsforgeAdapter(client);
