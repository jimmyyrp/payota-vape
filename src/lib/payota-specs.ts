import "server-only";
import { getAdminClient } from "./supabase";

export interface VapeSpec {
  id: number;
  group_name: string;
  label: string;
  value: string;
  sort_index: number;
}

/** Semua master spesifikasi (untuk pencarian cepat di form produk). */
export async function listVapeSpecs(): Promise<VapeSpec[]> {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_specs")
    .select("*")
    .order("sort_index", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}