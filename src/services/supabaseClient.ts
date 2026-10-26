import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_SUPABASE_KEY = 'js_invoice_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Retrieve active Supabase credentials (environment variable or UI-saved in localStorage)
 */
export function getSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  let url = (metaEnv.VITE_SUPABASE_URL as string) || '';
  let anonKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_SUPABASE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.url && parsed?.anonKey) {
          url = parsed.url;
          anonKey = parsed.anonKey;
        }
      }
    } catch (e) {
      console.warn('Error reading stored Supabase config:', e);
    }
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SUPABASE_KEY, JSON.stringify(config));
    cachedClient = null; // Invalidate cache so new credentials take effect immediately
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('https://'));
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Tests connection to Supabase database
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'Please provide both Supabase Project URL and Anon Key.' };
    }

    if (!url.startsWith('https://')) {
      return { success: false, message: 'Project URL must start with https://' };
    }

    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('invoices').select('id').limit(1);

    if (error) {
      // 42P01 means table does not exist yet (connection was successful, but schema needs to be run)
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables not found yet — please run supabase-schema.sql in Supabase SQL Editor).',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Please check credentials.' };
  }
}
