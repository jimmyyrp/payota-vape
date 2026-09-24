import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Klien publik (anon) — aman dipakai dari server maupun browser.
 * RLS membatasi pembacaan ke data aktif saja.
 */
export function getPublicClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env");
  }
  return createClient(url, anonKey);
}

/**
 * Klien admin (service role) — SERVER ONLY. Melewati RLS.
 * Jangan pernah dipakai dari komponen/klien browser.
 */
export function getAdminClient(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di .env");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}