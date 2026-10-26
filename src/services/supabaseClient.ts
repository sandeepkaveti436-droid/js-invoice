import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_SUPABASE_KEY = 'js_invoice_supabase_config_v1';

export const DEFAULT_SUPABASE_URL = 'https://licsggaijhpbhyrgpdfv.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpY3NnZ2FpamhwYmh5cmdwZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMjQwNTUsImV4cCI6MjEwODYwMDA1NX0.UAkt26vOBrvyZaKuv8o2nusRfBExUqfrgg-40-8awBc';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Strips any trailing slashes or /rest/v1 paths from user-provided URLs
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  let cleaned = (rawUrl || '').trim();
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  return cleaned.trim();
}

/**
 * Retrieve active Supabase credentials (environment variable or UI-saved in localStorage)
 */
export function getSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  let url = (metaEnv.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
  let anonKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

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

  return {
    url: sanitizeSupabaseUrl(url),
    anonKey: anonKey.trim(),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== 'undefined') {
    const sanitized = {
      url: sanitizeSupabaseUrl(config.url),
      anonKey: config.anonKey.trim(),
    };
    localStorage.setItem(STORAGE_SUPABASE_KEY, JSON.stringify(sanitized));
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
  rawUrl: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = sanitizeSupabaseUrl(rawUrl);
    const key = (anonKey || '').trim();

    if (!url || !key) {
      return { success: false, message: 'Please provide both Supabase Project URL and Anon Key.' };
    }

    if (!url.startsWith('https://')) {
      return { success: false, message: 'Project URL must start with https://' };
    }

    const testClient = createClient(url, key);
    const { error } = await testClient.from('invoices').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables not found yet — please run supabase-schema.sql in Supabase SQL Editor).',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to your live Supabase cloud database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Please check credentials.' };
  }
}
