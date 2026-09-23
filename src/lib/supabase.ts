import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration v19.0
 * Menggunakan host produksi opymtspoyjvfbtrrrfzg.supabase.co
 * Handle missing env vars gracefully during build time
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://opymtspoyjvfbtrrrfzg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Buat Supabase client hanya jika key tersedia.
 * Di build time (SSR tanpa env), kembalikan dummy client agar build tidak crash.
 */
function createSupabaseClient(): SupabaseClient {
  if (!supabaseAnonKey) {
    // Build-time fallback: buat client minimum agar TypeScript tidak error
    // Namun semua query akan gagal secara graceful di runtime
    return createClient(supabaseUrl, 'dummy-key-build-time-fallback');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();
