import { getAdminClient } from "./supabase";
import type { ProductSpec } from "@/data/products";

export interface ProductInput {
  slug: string;
  index: number;
  category: string;
  name: string;
  tagline: string;
  description: string;
  specs: ProductSpec[];
  art: string;
  glow: string;
  glowSoft: string;
  badge: string;
  featured: boolean;
  price: string;
  isActive: boolean;
}

export interface CategoryInput {
  slug: string;
  name: string;
  tagline: string;
  isActive: boolean;
}

function productToDb(input: ProductInput) {
  return {
    slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "produk",
    index: Number(input.index) || 0,
    category: input.category.trim() || "Perangkat",
    name: input.name.trim(),
    tagline: input.tagline,
    description: input.description,
    specs: input.specs && input.specs.length ? JSON.stringify(input.specs) : "[]",
    art: input.art,
    glow: input.glow,
    glow_soft: input.glowSoft,
    badge: input.badge || null,
    featured: !!input.featured,
    price: input.price,
    is_active: !!input.isActive,
  };
}

/** Semua produk (termasuk nonaktif) untuk panel admin. */
export async function listAllProducts() {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_products")
    .select("*")
    .order("index", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProductById(id: number) {
  const client = getAdminClient();
  const { data, error } = await client.from("payota_products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(input: ProductInput) {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_products")
    .insert(productToDb(input))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: number, input: ProductInput) {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_products")
    .update(productToDb(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: number) {
  const client = getAdminClient();
  const { error } = await client.from("payota_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAllCategories() {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_categories")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(input: CategoryInput) {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_categories")
    .insert({
      slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      name: input.name.trim(),
      tagline: input.tagline,
      is_active: !!input.isActive,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: number, input: CategoryInput) {
  const client = getAdminClient();
  const { data, error } = await client
    .from("payota_categories")
    .update({
      slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      name: input.name.trim(),
      tagline: input.tagline,
      is_active: !!input.isActive,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: number) {
  const client = getAdminClient();
  const { error } = await client.from("payota_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}