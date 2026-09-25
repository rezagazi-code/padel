// Supabase client singleton.
// Config priority: explicit env vars (Render/production) → manual config from
// SupabaseModal (localStorage, dev) → null (app runs on local mock data).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const LS_URL_KEY = 'padelpro_v1_sb_url';
const LS_KEY_KEY = 'padelpro_v1_sb_key';

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };
  try {
    const url = localStorage.getItem(LS_URL_KEY) || '';
    const anonKey = localStorage.getItem(LS_KEY_KEY) || '';
    if (url && anonKey) return { url, anonKey };
  } catch {
    /* ignore */
  }
  return null;
}

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const cfg = getSupabaseConfig();
  client = cfg ? createClient(cfg.url, cfg.anonKey) : null;
  return client;
}

export function resetSupabaseClient() {
  client = undefined;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
