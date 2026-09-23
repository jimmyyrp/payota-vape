import { createClient } from '@supabase/supabase-js';

/**
 * Supabase helper server-only.
 * Membuat client dengan service-role key untuk operasi sensitif
 * (upload/hapus storage) yang TIDAK boleh diekspos ke browser.
 */

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://opymtspoyjvfbtrrrfzg.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}