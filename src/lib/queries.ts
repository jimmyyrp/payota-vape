/**
 * Vape Store - Centralized Supabase Query Helpers
 * Semua query database terpusat untuk menghindari duplikasi.
 */

import { supabase } from './supabase';
import type { Post, Category, SubCategory, User, Testimonial, TestimonialToken, SiteSetting } from './types';

// ============================================
// POSTS / PRODUK QUERIES
// ============================================

/** Mengambil semua products lengkap dengan kategori, sub-kategori, dan gambar */
export async function fetchAllPosts() {
  const PAGE = 1000;
  let all: Post[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.rpc('get_products_complete').range(offset, offset + PAGE - 1);
    if (error) throw error;
    const batch = (data || []) as Post[];
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

/** Mengambil detail satu post berdasarkan ID */
export async function fetchPostById(id: number | string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories(category_id, categories(id, name)),
      product_sub_categories(sub_category_id, sub_categories(id, name)),
      product_images(url_images, urutan)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/** Menambah post baru */
export async function createPost(payload: { title: string; price: number; is_active: boolean }) {
  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Memperbarui post */
export async function updatePost(id: number, payload: Record<string, unknown>) {
  const { error } = await supabase
    .from('products')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

/** Soft delete post */
export async function softDeletePost(id: number) {
  const { data, error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .single();

  // PGRST116 = tidak ada baris yang cocok (sudah di Sampah) → terjemahkan
  // ke pesan ramah agar admin tidak melihat "No rows found for select".
  if (error) {
    if ((error as { code?: string })?.code === 'PGRST116') {
      throw new Error('Karya tidak ditemukan atau sudah berada di Sampah.');
    }
    throw error;
  }
  if (!data) throw new Error('Karya tidak ditemukan atau sudah berada di Sampah.');
}

/** Menghapus semua relasi post (categories, sub_categories, images) */
export async function clearPostRelations(postId: number) {
  await Promise.all([
    supabase.from('product_categories').delete().eq('product_id', postId),
    supabase.from('product_sub_categories').delete().eq('product_id', postId),
    supabase.from('product_images').delete().eq('product_id', postId),
  ]);
}

/** Menyimpan relasi kategori post */
export async function savePostCategories(postId: number, categoryIds: number[]) {
  if (categoryIds.length > 0) {
    const { error } = await supabase
      .from('product_categories')
      .insert(categoryIds.map(id => ({ product_id: postId, category_id: id })));
    if (error) throw error;
  }
}

/** Menyimpan relasi sub-kategori post */
export async function savePostSubCategories(postId: number, subCategoryIds: number[]) {
  if (subCategoryIds.length > 0) {
    const { error } = await supabase
      .from('product_sub_categories')
      .insert(subCategoryIds.map(id => ({ product_id: postId, sub_category_id: id })));
    if (error) throw error;
  }
}

/** Menyimpan gambar post */
export async function savePostImages(postId: number, urls: string[]) {
  if (urls.length > 0) {
    const { error } = await supabase
      .from('product_images')
      .insert(urls.map((url, i) => ({ product_id: postId, url_images: url, urutan: i })));
    if (error) throw error;
  }
}

/** Increment view count post */
export async function incrementPostViews(postId: number) {
  await supabase.rpc('increment_product_views', { target_id: postId });
}

// ============================================
// CATEGORIES & SUB-CATEGORIES QUERIES
// ============================================

/** Mengambil semua kategori aktif */
export async function fetchActiveCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('is_active', true)
    .order('name');

  if (error) throw error;
  return (data || []) as Category[];
}

/** Mengambil semua kategori (tanpa filter soft-delete) */
export async function fetchAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('name')
;

  if (error) throw error;
  return (data || []) as Category[];
}

/** Mengambil semua sub-kategori */
export async function fetchAllSubCategories() {
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*, categories(name)')
    .is('deleted_at', null)
    .order('name');

  if (error) throw error;
  return (data || []) as SubCategory[];
}

/** Mengambil data kategori dan sub-kategori sekaligus */
export async function fetchCategoryData() {
  const [catRes, subRes] = await Promise.all([
    fetchAllCategories(),
    fetchAllSubCategories(),
  ]);
  return { categories: catRes, subCategories: subRes };
}

/** Cek apakah kategori/sub-kategori masih digunakan oleh post */
export async function checkCategoryUsage(ids: number[], type: 'category' | 'sub_category'): Promise<boolean> {
  const table = type === 'category' ? 'product_categories' : 'product_sub_categories';
  const column = type === 'category' ? 'category_id' : 'sub_category_id';

  const { data, error } = await supabase
    .from(table)
    .select(column)
    .in(column, ids);

  return !error && data !== null && data.length > 0;
}

// ============================================
// USERS / TEAM QUERIES
// ============================================

/** Mengambil semua anggota tim */
export async function fetchTeamMembers() {
  const { data, error } = await supabase.rpc('get_team_members');
  if (error) throw error;
  return (data || []) as User[];
}

// ============================================
// TESTIMONIALS QUERIES
// ============================================

/** Mengambil semua testimoni */
export async function fetchTestimonials() {
  // Fetch in batches to avoid Supabase's 1000-row default limit
  const PAGE = 1000;
  let all: Testimonial[] = [];
  let off = 0;
  while (true) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('id', { ascending: false })
      .range(off, off + PAGE - 1);
    if (error) throw error;
    const batch = (data || []) as Testimonial[];
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    off += PAGE;
  }
  return all;
}

/** Mengambil jumlah testimoni aktif */
export async function fetchTestimonialCount() {
  const { count, error } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .filter('deleted_at', 'is', null);

  if (error) throw error;
  return count || 0;
}

/** Mengambil semua token testimoni */
export async function fetchTestimonialTokens() {
  const { data, error } = await supabase
    .from('review_tokens')
    .select('*')
    .order('id', { ascending: false })
;

  if (error) throw error;
  return (data || []) as TestimonialToken[];
}

// ============================================
// SITE SETTINGS QUERIES
// ============================================

/** Mengambil semua pengaturan situs */
export async function fetchSiteSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;

  const mapped: Record<string, string> = {};
  (data || []).forEach((item: SiteSetting) => {
    mapped[item.key] = item.value;
  });
  return mapped;
}

/** Menyimpan pengaturan situs */
export async function saveSiteSettings(settings: Record<string, string>) {
  const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' });
  if (error) throw error;
}

// ============================================
// UTILITY
// ============================================

/** Trigger global revalidation */
export async function triggerRevalidation() {
  try {
    const secret = typeof window !== 'undefined' ? localStorage.getItem('fee_session_token') || '' : '';
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${secret}` },
    });
  } catch (e) {
    console.error("Revalidation failed:", e);
  }
}
