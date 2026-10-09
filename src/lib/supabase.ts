// Supabase client singleton.
// Config priority: explicit env vars (Render/production) → manual config from
// SupabaseModal (localStorage, dev) → null (app runs on local mock data).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const LS_URL_KEY = 'padelpro_v1_sb_url';
const LS_KEY_KEY = 'padelpro_v1_sb_key';

// Custom storage adapter using Capacitor Preferences for native platforms
// This persists across app updates, unlike WebView localStorage which can be cleared
const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string): Promise<void> => {
    await Preferences.remove({ key });
  },
};

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
  if (!cfg) {
    client = null;
    return client;
  }
  // Use Capacitor Preferences for session storage on native platforms
  // This survives app updates, unlike WebView localStorage
  const isNative = Capacitor.isNativePlatform();
  client = createClient(cfg.url, cfg.anonKey, {
    auth: {
      storage: isNative ? capacitorStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}

export function resetSupabaseClient() {
  client = undefined;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
