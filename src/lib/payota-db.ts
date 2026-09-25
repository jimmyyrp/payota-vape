import type {
  Product,
  ProductSpec,
  ProductCategory,
  ArtVariant,
} from "@/data/products";
import { getPublicClient } from "./supabase";

export interface PayotaCategory {
  slug: string;
  name: string;
  tagline: string;
}

interface ProductRow {
  slug: string;
  index: number;
  category: string;
  name: string;
  tagline: string;
  description: string;
  specs: ProductSpec[] | string;
  art: string;
  badge: string | null;
  featured: boolean;
  price: string;
  image: string | null;
}

const DEFAULT_ART: ArtVariant = "device";

function parseSpecs(raw: ProductSpec[] | string): ProductSpec[] {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.slug,
    index: row.index,
    name: row.name,
    category: row.category as ProductCategory,
    tagline: row.tagline,
    description: row.description,
    specs: parseSpecs(row.specs),
    badge: (row.badge as Product["badge"]) ?? undefined,
    featured: row.featured,
    art: (row.art as ArtVariant) || DEFAULT_ART,
    price: row.price,
    image: row.image ?? undefined,
  };
}

/** Daftar kategori aktif dari DB (untuk filter & tagline). */
export async function getCategories(): Promise<PayotaCategory[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from("payota_categories")
    .select("slug, name, tagline")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }
  return (data ?? []) as PayotaCategory[];
}

/** Seluruh produk aktif (katalog publik), urut sesuai index. */
export async function getCatalog(): Promise<Product[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from("payota_products")
    .select("*")
    .eq("is_active", true)
    .order("index", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("getCatalog error:", error.message);
    return [];
  }
  return ((data ?? []) as ProductRow[]).map(toProduct);
}

/** Produk unggulan (featured && aktif). */
export async function getFeatured(): Promise<Product | null> {
  const client = getPublicClient();
  const { data, error } = await client
    .from("payota_products")
    .select("*")
    .eq("is_active", true)
    .eq("featured", true)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return toProduct(data as ProductRow);
}

/** Produk tunggal berdasarkan slug. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getPublicClient();
  const { data, error } = await client
    .from("payota_products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return toProduct(data as ProductRow);
}