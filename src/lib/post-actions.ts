'use client';

/**
 * post-actions - Aksi mutasi karya yang dipakai bersama oleh panel admin
 * DAN alat kelola inline di halaman publik (satu logika, tidak menyimpang).
 * Berjalan via Supabase anon key; RLS mengizinkan staff menulis.
 */

import { supabase } from '@/lib/supabase';

export type ActionResult = { ok: true } | { ok: false; error: string };
export type DuplicateResult = { ok: true; newId: number } | { ok: false; error: string };

interface RawSourceRow {
  title: string;
  price?: number;
  deskripsi?: string;
  gambar_thumbnail?: string;
  sub_category_id?: number | null;
  created_at?: string | null;
  product_categories?: { category_id: number }[];
  product_sub_categories?: { sub_category_id: number }[];
  product_images?: { url_images: string }[];
}

/**
 * Duplikat karya menjadi DRAF baru:
 * - judul + " (Salinan)", harga/deskripsi/klasifikasi/galeri ikut
 * - URL Cloudinary reuse (tanpa upload ulang)
 * - views reset 0, is_active=false agar tak tayang tak sengaja.
 */
export async function duplicatePostById(postId: number | string): Promise<DuplicateResult> {
  const SELECT =
    'title, price, deskripsi, gambar_thumbnail, sub_category_id, ' +
    'product_categories(category_id), product_sub_categories(sub_category_id), product_images(url_images)';

  const { data: src, error: fetchErr } = await supabase
    .from('products')
    .select(SELECT)
    .eq('id', postId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!src) return { ok: false, error: 'Karya sumber tidak ditemukan.' };

  const source = src as unknown as RawSourceRow;
  const subIds = Array.from(
    new Set<number>([
      ...(source.product_sub_categories || []).map((j) => j.sub_category_id),
      ...(source.sub_category_id ? [source.sub_category_id] : []),
    ])
  );

  const payload = {
    title: `${source.title} (Salinan)`,
    price: source.price || 0,
    deskripsi: source.deskripsi || '',
    is_active: false,
    views: 0,
    // Kolom FK langsung untuk halaman detail publik
    sub_category_id: subIds[0] ?? null,
    gambar_thumbnail: source.gambar_thumbnail || '',
  };

  const { data: dup, error: dupErr } = await supabase
    .from('products')
    .insert([payload])
    .select('id')
    .single();
  if (dupErr) return { ok: false, error: dupErr.message };
  const newId = (dup as { id: number }).id;

  const catIds = (source.product_categories || []).map((j) => j.category_id);
  if (catIds.length > 0) {
    const { error } = await supabase
      .from('product_categories')
      .insert(catIds.map((category_id) => ({ product_id: newId, category_id })));
    if (error) return { ok: false, error: error.message };
  }
  if (subIds.length > 0) {
    const { error } = await supabase
      .from('product_sub_categories')
      .insert(subIds.map((sub_category_id) => ({ product_id: newId, sub_category_id })));
    if (error) return { ok: false, error: error.message };
  }
  const urls = (source.product_images || []).map((i) => i.url_images);
  if (urls.length > 0) {
    const { error } = await supabase
      .from('product_images')
      .insert(urls.map((url_images, i) => ({ product_id: newId, url_images, urutan: i })));
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, newId };
}

/** Tayangkan / arsipkan karya (arsip = disembunyikan dari galeri publik). */
export async function setPostActiveState(postId: number | string, isActive: boolean): Promise<ActionResult> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export type CreateFromImageResult =
  | {
      ok: true;
      newId: number;
      title: string;
      price: number;
      deskripsi: string;
      category_ids: number[];
      sub_category_ids: number[];
    }
  | { ok: false; error: string };
export type MoveImageResult = { ok: true } | { ok: false; error: string };

const IMAGE_MOVE_SELECT =
  'title, price, deskripsi, gambar_thumbnail, sub_category_id, created_at, ' +
  'product_categories(category_id), product_sub_categories(sub_category_id)';

/**
 * Buat produk baru (draf nonaktif) yang MENYALIN metadata produk sumber
 * tetapi HANYA berisi satu gambar (URL yang dipilih). Dipakai aksi
 * "Jadikan Produk Baru" pada gambar di detail karya.
 * - created_at disalin dari produk sumber (bukan waktu sekarang)
 * - gambar terpilih DIPINDAHKAN dari sumber ke produk baru (baris product_images
 *   sumber dihapus, thumbnail sumber diperbaiki jika gambar tsb foto pertamanya)
 */
export async function createProductFromImage(
  postId: number | string,
  imageUrl: string
): Promise<CreateFromImageResult> {
  const { data: src, error: fetchErr } = await supabase
    .from('products')
    .select(IMAGE_MOVE_SELECT)
    .eq('id', postId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!src) return { ok: false, error: 'Karya sumber tidak ditemukan.' };

  const source = src as unknown as RawSourceRow;

  // Aturan katalog: karya harus selalu menyisakan minimal 1 gambar.
  // "Jadikan Produk Baru" MEMINDAHKAN gambar ini dari sumber, jadi diblokir
  // apabila ini satu-satunya foto sumber.
  const { count: srcImgCount, error: cntErr } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', postId);
  if (cntErr) return { ok: false, error: cntErr.message };
  if ((srcImgCount ?? 0) <= 1) {
    return { ok: false, error: 'Karya sumber harus menyisakan minimal 1 gambar. Tambahkan foto lain dulu.' };
  }

  const subIds = Array.from(
    new Set<number>([
      ...(source.product_sub_categories || []).map((j) => j.sub_category_id),
      ...(source.sub_category_id ? [source.sub_category_id] : []),
    ])
  );

  const payload = {
    title: source.title,
    price: source.price || 0,
    deskripsi: source.deskripsi || '',
    is_active: false,
    views: 0,
    sub_category_id: subIds[0] ?? null,
    gambar_thumbnail: imageUrl,
    created_at: source.created_at || new Date().toISOString(),
  };

  const { data: created, error: insErr } = await supabase
    .from('products')
    .insert([payload])
    .select('id')
    .single();
  if (insErr) return { ok: false, error: insErr.message };
  const newId = (created as { id: number }).id;

  const catIds = (source.product_categories || []).map((j) => j.category_id);
  if (catIds.length > 0) {
    const { error } = await supabase
      .from('product_categories')
      .insert(catIds.map((category_id) => ({ product_id: newId, category_id })));
    if (error) return { ok: false, error: error.message };
  }
  if (subIds.length > 0) {
    const { error } = await supabase
      .from('product_sub_categories')
      .insert(subIds.map((sub_category_id) => ({ product_id: newId, sub_category_id })));
    if (error) return { ok: false, error: error.message };
  }

  // Ambil baris product_images sumber yang bersangkutan
  const { data: imgRow, error: imgErr } = await supabase
    .from('product_images')
    .select('id, urutan')
    .eq('product_id', postId)
    .eq('url_images', imageUrl)
    .maybeSingle();
  if (imgErr) return { ok: false, error: imgErr.message };

  if (imgRow) {
    // Pindahkan baris sumber -> produk baru
    const { error: updErr } = await supabase
      .from('product_images')
      .update({ product_id: newId, urutan: 0 })
      .eq('id', imgRow.id);
    if (updErr) return { ok: false, error: updErr.message };

    // Perbaiki thumbnail sumber bila gambar yang dipindah adalah foto pertamanya
    if (source.gambar_thumbnail === imageUrl) {
      const { data: remaining, error: remErr } = await supabase
        .from('product_images')
        .select('url_images')
        .eq('product_id', postId)
        .order('urutan', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (remErr) return { ok: false, error: remErr.message };
      const { error: thumbErr } = await supabase
        .from('products')
        .update({ gambar_thumbnail: remaining ? remaining.url_images : '', updated_at: new Date().toISOString() })
        .eq('id', postId);
      if (thumbErr) return { ok: false, error: thumbErr.message };
    }
  } else {
    // Sumber tak punya baris tsb (misal hanya referensi) -> sisipkan utk produk baru
    const { error: imgInsErr } = await supabase
      .from('product_images')
      .insert([{ product_id: newId, url_images: imageUrl, urutan: 0 }]);
    if (imgInsErr) return { ok: false, error: imgInsErr.message };
  }

  return {
    ok: true,
    newId,
    title: source.title,
    price: source.price || 0,
    deskripsi: source.deskripsi || '',
    category_ids: catIds,
    sub_category_ids: subIds,
  };
}

/**
 * Pindahkan satu gambar dari satu karya ke karya lain.
 * - Baris product_images yang bersangkutan dipindah (product_id diganti + urutan baru)
 * - Thumbnail sumber diperbaiki bila gambar yang dipindah adalah foto pertamanya
 * - Thumbnail tujuan diisi bila tujuan belum punya gambar
 */
export async function moveImageToProduct(
  fromPostId: number | string,
  imageUrl: string,
  targetPostId: number | string
): Promise<MoveImageResult> {
  if (String(fromPostId) === String(targetPostId)) {
    return { ok: false, error: 'Tujuan tidak boleh sama dengan karya sumber.' };
  }

  // Aturan katalog: karya harus selalu menyisakan minimal 1 gambar.
  // Pindah memindahkan baris ini dari sumber; diblokir bila foto terakhir.
  const { count: srcImgCount, error: cntErr } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', fromPostId);
  if (cntErr) return { ok: false, error: cntErr.message };
  if ((srcImgCount ?? 0) <= 1) {
    return { ok: false, error: 'Karya sumber harus menyisakan minimal 1 gambar. Tambahkan foto lain dulu.' };
  }

  // 1. Ambil baris product_images sumber yang sesuai
  const { data: imgRow, error: imgErr } = await supabase
    .from('product_images')
    .select('id, urutan')
    .eq('product_id', fromPostId)
    .eq('url_images', imageUrl)
    .maybeSingle();
  if (imgErr) return { ok: false, error: imgErr.message };
  if (!imgRow) return { ok: false, error: 'Gambar tidak ditemukan pada karya sumber.' };

  // 2. Ambil informasi sumber (gambar_thumbnail) dan urutan maksimum tujuan
  const [srcRes, tgtRes] = await Promise.all([
    supabase.from('products').select('gambar_thumbnail').eq('id', fromPostId).maybeSingle(),
    (async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('urutan')
        .eq('product_id', targetPostId)
        .order('urutan', { ascending: false })
        .limit(1)
        .maybeSingle();
      return { data, error };
    })(),
  ]);
  if (srcRes.error) return { ok: false, error: srcRes.error.message };
  if (tgtRes.error) return { ok: false, error: tgtRes.error.message };

  const targetMaxUrutan = tgtRes.data ? (tgtRes.data.urutan ?? 0) : -1;

  // 3. Pindahkan baris -> product_id tujuan, urutan ke akhir
  const { error: updErr } = await supabase
    .from('product_images')
    .update({ product_id: targetPostId, urutan: targetMaxUrutan + 1 })
    .eq('id', imgRow.id);
  if (updErr) return { ok: false, error: updErr.message };

  // 4. Perbaiki thumbnail sumber bila foto yang dipindah adalah foto pertama
  if (srcRes.data && srcRes.data.gambar_thumbnail === imageUrl) {
    const { data: remaining, error: remErr } = await supabase
      .from('product_images')
      .select('url_images')
      .eq('product_id', fromPostId)
      .order('urutan', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (remErr) return { ok: false, error: remErr.message };
    const nextThumb = remaining ? remaining.url_images : '';
    const { error: thumbErr } = await supabase
      .from('products')
      .update({ gambar_thumbnail: nextThumb, updated_at: new Date().toISOString() })
      .eq('id', fromPostId);
    if (thumbErr) return { ok: false, error: thumbErr.message };
  }

  // 5. Isi thumbnail tujuan bila tujuan belum punya gambar sama sekali
  if (!tgtRes.data) {
    const { error: tgtThumbErr } = await supabase
      .from('products')
      .update({ gambar_thumbnail: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', targetPostId);
    if (tgtThumbErr) return { ok: false, error: tgtThumbErr.message };
  }

  return { ok: true };
}
