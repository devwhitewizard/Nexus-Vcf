import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns an authenticated Supabase server client configured with server credentials.
 * Uses singleton caching for high performance in serverless functions.
 */
export function getSupabaseServer(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl) {
    throw new Error('[Supabase Server] Missing required SUPABASE_URL environment variable.');
  }

  if (!supabaseKey) {
    throw new Error('[Supabase Server] Missing required SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  cachedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
