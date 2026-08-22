import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Returns an authenticated Supabase server client configured with credentials
 * dynamically re-reading process.env to ensure updated .env credentials apply immediately.
 */
export function getSupabaseServer(): SupabaseClient {
  dotenv.config(); // Reload env vars if changed

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://bgiweifcuhrqehmkmrqf.supabase.co'
  ).trim();

  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_KEY ||
    'placeholder-key'
  ).trim();

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
