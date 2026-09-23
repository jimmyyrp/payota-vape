'use client';

/**
 * useKaryaAdmin - Centralized state & business logic for admin Karya.
 * Handles: data fetching, CRUD, filtering, pagination, image cropping.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { friendlyDbError } from '@/lib/db-errors';
import { compressAndUpload, destroyStorageAsset, getStoragePathFromUrl } from '@/lib/image-upload';
import { duplicatePostById } from '@/lib/post-actions';
import { logActivity } from '@/lib/activity-log';
import type { ActivitySnapshot } from '@/lib/activity-log';
import { RATIOS, useImageCropper, type CropState } from '@/hooks/use-image-cropper';

// Re-export agar consumer lama (admin page, karya-form-dialog, editor publik)
// tetap bisa mengimpor dari satu sumber yang sama.
export { RATIOS };
export type { CropState };

/** Bangun snapshot baris `products` dari objek KaryaPost (state). */
function karyaPostRow(item: KaryaPost): Record<string, unknown> {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    views: item.views ?? 0,
    is_active: item.is_active ?? true,
    deskripsi: item.deskripsi ?? '',
    gambar_thumbnail: item.gambar_thumbnail ?? '',
    sub_category_id: item.sub_category_id ?? null,
    created_at: item.created_at,
    updated_at: item.updated_at ?? null,
    deleted_at: item.deleted_at ?? null,
  };
}

/** Bangun snapshot relasi child utk karya (junction + product_images) dari KaryaPost. */
function karyaChildSnapshots(item: KaryaPost): ActivitySnapshot {
  const snaps: ActivitySnapshot = [];
  snaps.push({
    table: 'product_categories',
    rows: (item.categories || []).map((c) => ({ product_id: item.id, category_id: c.id })),
  });
  snaps.push({
    table: 'product_sub_categories',
    rows: Array.from(
      new Set([
        ...(item.sub_categories || []).map((sc) => sc.id),
        ...(item.sub_category_id ? [item.sub_category_id] : []),
      ])
    ).map((id) => ({ product_id: item.id, sub_category_id: id })),
  });
  snaps.push({
    table: 'product_images',
    rows: (item.images || []).map((img, i) => ({ product_id: item.id, url_images: img.url_images, urutan: i })),
  });
  return snaps;
}

// ============================================
// TYPES
// ============================================

export interface GalleryItem {
  url: string;
}

export interface PostFormData {
  title: string;
  price: string;
  deskripsi: string;
  gallery: GalleryItem[];
  category_ids: number[];
  sub_category_ids: number[];
  is_active: boolean;
}

export interface KaryaPost {
  id: number;
  title: string;
  deskripsi?: string;
  gambar_thumbnail?: string;
  sub_category_id?: number;
  price: number;
  views: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  images?: { url_images: string }[];
  categories?: { id: number; name: string }[];
  sub_categories?: { id: number; name: string }[];
  [key: string]: unknown;
}

export interface CategoryEntry {
  id: number;
  name: string;
  deleted_at?: string | null;
}

export interface SubCategoryEntry {
  id: number;
  name: string;
  category_id: number;
  deleted_at?: string | null;
  categories?: { name: string };
}

/** Pesan validasi per-field; undefined = field valid. */
export interface FieldErrors {
  title?: string;
  price?: string;
  deskripsi?: string;
  gallery?: string;
  categories?: string;
  subcategories?: string;
}

/** Validasi murni form karya - dipakai requestSave & live re-check. */
export function validatePostForm(data: PostFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.title.trim()) {
    errors.title = 'Judul karya wajib diisi.';
  }
  const price = parseFloat(data.price || '0');
  if (data.price.trim() === '' || Number.isNaN(price)) {
    errors.price = 'Harga harus berupa angka.';
  } else if (price < 0) {
    errors.price = 'Harga tidak boleh negatif.';
  }
  if (data.gallery.length === 0) {
    errors.gallery = 'Minimal 1 foto visual untuk karya.';
  }
  if (data.category_ids.length !== 1) {
    errors.categories = data.category_ids.length === 0 ? 'Pilih tepat 1 kategori.' : 'Hanya boleh 1 kategori per karya.';
  }
  if (data.sub_category_ids.length !== 1) {
    errors.subcategories = data.sub_category_ids.length === 0 ? 'Pilih tepat 1 sub kategori.' : 'Hanya boleh 1 sub kategori per karya.';
  }
  if ((data.deskripsi || '').length > 2000) {
    errors.deskripsi = 'Deskripsi maksimal 2000 karakter.';
  }
  return errors;
}

const ITEMS_PER_PAGE = 10;

/** Kolom select untuk daftar karya: embed junction dinormalisasi di client. */
const POST_SELECT =
  '*, product_images(url_images, urutan), product_categories(category_id, categories(id, name)), product_sub_categories(sub_category_id, sub_categories(id, name))';

interface RawPostRow {
  product_images?: { url_images: string; urutan: number }[];
  product_categories?: { categories: { id: number; name: string } | null }[];
  product_sub_categories?: { sub_categories: { id: number; name: string } | null }[];
  [key: string]: unknown;
}

/**
 * Ubah bentuk embed junction menjadi array flat `{id,name}` yang dipakai UI.
 * - product_images -> images (agar item.images tersedia untuk tabel & form edit)
 * - product_categories/product_sub_categories -> categories/sub_categories flat
 * Embed langsung `categories(name)` ambigu (FK + junction) -> PGRST201,
 * maka query memakai junction dan dipetakan di sini.
 */
function normalizePostRow(row: RawPostRow): KaryaPost {
  const cats = (row.product_categories || [])
    .map((j) => j.categories)
    .filter((c): c is { id: number; name: string } => !!c);
  const subs = (row.product_sub_categories || [])
    .map((j) => j.sub_categories)
    .filter((s): s is { id: number; name: string } => !!s);
  // Rename product_images -> images agar UI bisa akses item.images
  const imgs = (row.product_images || [])
    .slice()
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
  const { product_categories: _pc, product_sub_categories: _ps, product_images: _pi, ...rest } = row;
  return { ...rest, categories: cats, sub_categories: subs, images: imgs } as unknown as KaryaPost;
}

/**
 * Ambil SEMUA post (aktif/draf atau sampah) dengan paging.
 * Server Supabase memaksa maks 1000 baris/request (db-max-rows=1000),
 * sehingga `.limit(10000)` diam-diam dipotong jadi 1000 -> data hilang.
 * Loop `.range()` di bawah batas server, batch sedang (embed berat) agar
 * ukuran tiap response tetap aman.
 */
const POST_PAGE_SIZE = 400;

async function fetchPostsPaged(isTrash: boolean): Promise<RawPostRow[]> {
  const rows: RawPostRow[] = [];
  const order = { ascending: false };
  let offset = 0;
  while (true) {
    let data: unknown;
    let error: unknown;
    if (isTrash) {
      ({ data, error } = await supabase
        .from('products')
        .select(POST_SELECT)
        .not('deleted_at', 'is', null)
        .order('deleted_at', order)
        .range(offset, offset + POST_PAGE_SIZE - 1));
    } else {
      ({ data, error } = await supabase
        .from('products')
        .select(POST_SELECT)
        .is('deleted_at', null)
        .order('id', order)
        .range(offset, offset + POST_PAGE_SIZE - 1));
    }
    if (error) throw error;
    const batch = (data || []) as RawPostRow[];
    rows.push(...batch);
    if (batch.length < POST_PAGE_SIZE) break;
    offset += POST_PAGE_SIZE;
  }
  return rows;
}

// ============================================
// HOOK
// ============================================

/**
 * Nilai awal filter/paginasi — dibaca dari URL (?status=&q=&cat=&sub=&page=)
 * oleh page.tsx agar refresh/tombol kembali tetap berada di halaman yang sama.
 */
export interface KaryaAdminInitialState {
  statusFilter?: 'all' | 'active' | 'draft';
  searchTerm?: string;
  catFilter?: string;
  subCatFilter?: string;
  currentPage?: number;
}

export function useKaryaAdmin(initial: KaryaAdminInitialState = {}) {
  const { toast } = useToast();

  // Data
  const [items, setItems] = useState<KaryaPost[]>([]);
  const [trashedItems, setTrashedItems] = useState<KaryaPost[]>([]);
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);

  // Filter status & sampah
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>(initial.statusFilter ?? 'all');
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<number | null>(null);

  // Form
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingItem, setEditingItem] = useState<KaryaPost | null>(null);

  // Validasi inline (tampil di dalam modal, bukan toast)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showValidation, setShowValidation] = useState(false);

  // Filter
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm ?? '');
  const [catFilter, setCatFilter] = useState(initial.catFilter ?? 'all');
  const [subCatFilter, setSubCatFilter] = useState(initial.subCatFilter ?? 'all');
  const [currentPage, setCurrentPage] = useState(() => {
    const p = initial.currentPage ?? 1;
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Crop (reusable: state + pemotongan gambar dibagi lewat useImageCropper)
  const {
    cropState,
    setCropState,
    openCropDialog: openCropDialogRaw,
    handleCropComplete,
    applyCrop: extractCroppedFile,
  } = useImageCropper();

  // Form data
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    price: '0',
    deskripsi: '',
    gallery: [],
    category_ids: [],
    sub_category_ids: [],
    is_active: true,
  });

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      // Select langsung (bukan RPC): get_products_complete memfilter is_active=true,
      // sehingga karya nonaktif menghilang dari panel dan tak bisa diaktifkan lagi.
      // Sekarang: semua karya aktif + draf, PLUS daftar sampah (soft-deleted).
      // PostgREST memotong tiap request ke maks 1000 baris -> fetchPostsPaged
      // melakukan loop .range() hingga SEMUA baris lengkap (bisa >1000).
      const [products, trash, catRes, subRes] = await Promise.all([
        fetchPostsPaged(false),
        fetchPostsPaged(true),
        supabase.from('categories').select('*').is('deleted_at', null).order('name').limit(1000),
        supabase.from('sub_categories').select('*').is('deleted_at', null).order('name').limit(1000),
      ]);
      if (catRes.error) throw catRes.error;
      if (subRes.error) throw subRes.error;
      setItems(products.map(normalizePostRow));
      setTrashedItems(trash.map(normalizePostRow));
      setCategories((catRes.data || []) as CategoryEntry[]);
      setSubCategories((subRes.data || []) as SubCategoryEntry[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
      toast({ variant: 'destructive', title: 'Gagal Memuat Data', description: message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // ============================================
  // FILTERING & PAGINATION
  // ============================================

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        const matchSearch = i.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat =
          catFilter === 'all' ||
          i.categories?.some((c) => c.id.toString() === catFilter);
        const matchSubCat =
          subCatFilter === 'all' ||
          i.sub_categories?.some((sc) => sc.id.toString() === subCatFilter) ||
          i.sub_category_id?.toString() === subCatFilter;
        const matchStatus =
          statusFilter === 'all' || (statusFilter === 'active' ? i.is_active : !i.is_active);
        return matchSearch && matchCat && matchSubCat && matchStatus;
      })
      .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime() || Number(b.id) - Number(a.id));
  }, [items, searchTerm, catFilter, subCatFilter, statusFilter]);

  // Kembali ke halaman 1 saat filter berubah agar hasil selalu terlihat.
  // TAPI JANGAN pada render pertama, agar ?page=N (mis. halaman 5) tetap
  // bertahan saat refresh/reload.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setCurrentPage(1);
  }, [statusFilter, searchTerm, catFilter, subCatFilter]);

  // Saat kategori induk berubah, subkategori lama bisa jadi tidak relevan -> reset.
  useEffect(() => {
    setSubCatFilter('all');
  }, [catFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Clamp currentPage: jika data berkurang dan currentPage melebihi totalPages,
// koreksi. Dijalankan hanya setelah data selesai dimuat (loading=false) —
// saat loading totalPages masih 0/1 dan akan salah me-reset ?page=5 ke 1.
  useEffect(() => {
    if (loading) return;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, loading]);

  // ============================================
  // FORM LOGIC
  // ============================================

  // Checksum for gallery order detection
  const galleryChecksum = useMemo(() => {
    return formData.gallery.map((item, i) => `${i}:${item.url.substring(item.url.lastIndexOf('/') + 1, item.url.lastIndexOf('/') + 40)}`).join('|');
  }, [formData.gallery]);

  // Original gallery checksum from editing item
  const originalGalleryChecksum = useMemo(() => {
    if (!editingItem) return '';
    return (editingItem.images || []).map((img, i) => `${i}:${img.url_images.substring(img.url_images.lastIndexOf('/') + 1, img.url_images.lastIndexOf('/') + 40)}`).join('|');
  }, [editingItem]);

  const isChanged = useMemo(() => {
    // New item: hanya perlu title terisi untuk mengaktifkan tombol simpan
    if (!editingItem) return formData.title.trim() !== '';
    if (formData.title !== editingItem.title) return true;
    if (parseFloat(formData.price || '0') !== (editingItem.price || 0)) return true;
    if ((formData.deskripsi || '') !== (editingItem.deskripsi || '')) return true;
    if (formData.is_active !== editingItem.is_active) return true;
    const oldCats = (editingItem.categories || []).map((c) => c.id).sort();
    const newCats = [...formData.category_ids].sort();
    if (JSON.stringify(oldCats) !== JSON.stringify(newCats)) return true;
    const oldSubCats = (editingItem.sub_categories || []).map((sc) => sc.id).sort();
    const newSubCats = [...formData.sub_category_ids].sort();
    if (JSON.stringify(oldSubCats) !== JSON.stringify(newSubCats)) return true;
    if (formData.gallery.length !== (editingItem.images?.length || 0)) return true;
    // Detect gallery reorder
    if (galleryChecksum !== originalGalleryChecksum) return true;
    return false;
  }, [formData, editingItem, galleryChecksum, originalGalleryChecksum]);

  const resetForm = useCallback(() => {
    setEditingItem(null);
    setFormData({
      title: '',
      price: '0',
      deskripsi: '',
      gallery: [],
      category_ids: [],
      sub_category_ids: [],
      is_active: true,
    });
  }, []);

  // Bersihkan validasi setiap kali modal ditutup
  useEffect(() => {
    if (!isAdding) {
      setShowValidation(false);
      setFieldErrors({});
    }
  }, [isAdding]);

  // Live re-validasi: pesan hilang otomatis begitu field diperbaiki
  useEffect(() => {
    if (showValidation) {
      setFieldErrors(validatePostForm(formData));
    }
  }, [formData, showValidation]);

  /**
   * Dipanggil tombol "Simpan Arsip". Validasi berjalan DI DALAM modal:
   * jika ada field invalid, banner + hint merah muncul di tempat;
   * modal konfirmasi terpisah dihapus agar tidak menumpuk (timpa).
   */
  const requestSave = useCallback((): boolean => {
    const errors = validatePostForm(formData);
    setFieldErrors(errors);
    setShowValidation(true);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const startEdit = useCallback(
    (item: KaryaPost) => {
      setEditingItem(item);
      // Galeri diambil SELURUHNYA dari product_images (urutan galeri yang
      // menentukan tampilan). gambar_thumbnail tidak dipakai sebagai
      // fallback agar urutan/foto yang dipilih selalu konsisten.
      const urls = (item.images || []).map((img) => img.url_images);
      // Aturan katalog: 1 karya = 1 kategori + 1 sub kategori.
      // Saat edit, ambil pilihan PERTAMA saja agar single-select selalu
      // konsisten di UI (data lama dengan banyak relasi diperkecil di sini).
      const firstCategory = (item.categories || []).slice(0, 1).map((c) => c.id);
      const firstSub = (item.sub_categories || [])[0]?.id ?? item.sub_category_id;
      setFormData({
        title: item.title,
        price: (item.price || 0).toString(),
        deskripsi: item.deskripsi || '',
        gallery: urls.map((u) => ({ url: u })),
        category_ids: firstCategory,
        sub_category_ids: firstSub != null ? [firstSub] : [],
        is_active: item.is_active ?? true,
      });
      setIsAdding(true);
    },
    []
  );

  // ============================================
  // SAVE
  // ============================================

  const handleSave = useCallback(async () => {
    // Safety-net: validasi ulang sebelum menyimpan ke server
    const errors = validatePostForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowValidation(true);
      return;
    }
    setIsSubmitting(true);
    try {
      // Urutan galeri final dipakai juga sebagai thumbnail (foto pertama)
      const finalUrls = formData.gallery.map((item) => item.url);
      const galleryChanged = !editingItem || galleryChecksum !== originalGalleryChecksum;

      // Kolom gambar_thumbnail selalu disinkronkan dengan foto PERTAMA
      // urutan galeri. Dengan begitu thumbnail tidak pernah memakai foto
      // yang berbeda dari urutan yang sudah diatur (foto yang dipilih saat
      // mengatur / scroll tampil dengan benar).
      const postPayload = {
        title: formData.title,
        price: parseFloat(formData.price || '0'),
        deskripsi: formData.deskripsi || '',
        is_active: formData.is_active,
        views: 0,
        // Kolom langsung: halaman detail publik membaca lewat FK ini
        sub_category_id: formData.sub_category_ids.length > 0 ? formData.sub_category_ids[0] : null,
        gambar_thumbnail: finalUrls[0] ?? '',
        updated_at: new Date().toISOString(),
      };

      let postId: number;
      if (editingItem) {
        // UPDATE: editingItem ada → selalu update, bukan insert
        const { error } = await supabase.from('products').update(postPayload).eq('id', editingItem.id);
        if (error) throw error;
        postId = editingItem.id;
      } else {
        // INSERT: item baru
        const { data, error } = await supabase
          .from('products')
          .insert([postPayload])
          .select()
          .single();
        if (error) throw error;
        postId = data.id;
      }

      // Upload sudah dilakukan langsung ke Supabase Storage saat applyCrop.
      // Di sini tinggal merapikan: asset lama yang dibuang dari galeri ikut dihapus.

      if (editingItem) {
        const keepUrls = new Set(finalUrls);
        const removedPublicIds = (editingItem.images || [])
          .map((img) => img.url_images)
          .filter((url) => url && !keepUrls.has(url))
          .map((url) => getStoragePathFromUrl(url))
          .filter((pid): pid is string => !!pid);

        await Promise.all(removedPublicIds.map((pid) => destroyStorageAsset(pid)));
      }

      // Kategori dapat disusun ulang setiap kali; gambar hanya disentuh jika berubah.
      const [catDel, subDel] = await Promise.all([
        supabase.from('product_categories').delete().eq('product_id', postId),
        supabase.from('product_sub_categories').delete().eq('product_id', postId),
      ]);
      if (catDel.error) throw catDel.error;
      if (subDel.error) throw subDel.error;

      if (galleryChanged) {
        const { error } = await supabase.from('product_images').delete().eq('product_id', postId);
        if (error) throw error;
      }

      // Save new relations — cek error satu per satu
      if (formData.category_ids.length > 0) {
        const { error } = await supabase
          .from('product_categories')
          .insert(formData.category_ids.map((id) => ({ product_id: postId, category_id: id })));
        if (error) throw error;
      }
      if (formData.sub_category_ids.length > 0) {
        const { error } = await supabase
          .from('product_sub_categories')
          .insert(
            formData.sub_category_ids.map((id) => ({ product_id: postId, sub_category_id: id }))
          );
        if (error) throw error;
      }
      if (galleryChanged && finalUrls.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .insert(finalUrls.map((url, i) => ({ product_id: postId, url_images: url, urutan: i })));
        if (error) throw error;
      }

      toast({ title: 'Arsip Diperbarui', description: 'Karya telah berhasil diterbitkan.' });

      // CATAT AKTIVITAS (audit + rollback)
      try {
        const before = editingItem
          ? [{ table: 'products', rows: [karyaPostRow(editingItem)] }, ...karyaChildSnapshots(editingItem)]
          : [];
        const after = editingItem
          ? []
          : [{ table: 'products', rows: [{ ...postPayload, id: postId }] }];
        await logActivity({
          module: 'karya',
          action: editingItem ? 'update' : 'create',
          summary: editingItem ? `Ubah karya "${editingItem.title}"` : `Buat karya "${formData.title}"`,
          refType: 'products',
          refId: postId,
          before,
          after,
          metadata: {
            primaryTable: 'products',
            childTables: ['product_categories', 'product_sub_categories', 'product_images'],
            refCol: 'product_id',
          },
        });
      } catch { /* non-fatal */ }

      // Tutup dialog terlebih dahulu agar DOM ringan sebelum fetchData (4 query besar)
      const isNew = !editingItem;
      setIsAdding(false);
      setEditingItem(null);

      // Reset ke halaman 1 hanya untuk item baru (item edit tetap di posisi halaman saat ini)
      if (isNew) setCurrentPage(1);

      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Kegagalan Sistem', description: friendlyDbError(err) });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingItem, fetchData, toast]);

  // ============================================
  // DELETE
  // ============================================

  const handleSoftDelete = useCallback(async () => {
    if (!deleteId || isProcessingRef.current) return;
    const idToDelete = deleteId;
    const snapItem = items.find((i) => i.id === idToDelete);
    setDeleteId(null);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', idToDelete);
      if (error) throw error;
      if (snapItem) {
        await logActivity({
          module: 'karya', action: 'soft_delete', refType: 'products', refId: idToDelete,
          summary: `Arsipkan karya "${snapItem.title}"`,
          before: [{ table: 'products', rows: [karyaPostRow(snapItem)] }],
          metadata: { primaryTable: 'products', childTables: [], refCol: 'product_id' },
        }).catch(() => {});
      }
      toast({ title: 'Item Dihapus', description: 'Data telah dipindahkan ke sampah sistem.' });
      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Menghapus', description: friendlyDbError(err) });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [deleteId, fetchData, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0 || isProcessingRef.current) return;
    const idsToDelete = [...selectedIds];
    const snapItems = items.filter((i) => idsToDelete.includes(i.id));
    setSelectedIds([]);
    setBulkDeleteConfirm(false);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .in('id', idsToDelete);
      if (error) throw error;
      await logActivity({
        module: 'karya', action: 'soft_delete', refType: 'products',
        summary: `Arsipkan ${idsToDelete.length} karya (masal)`,
        before: [{ table: 'products', rows: snapItems.map((i) => karyaPostRow(i)) }],
        metadata: { primaryTable: 'products', childTables: [], refCol: 'product_id' },
      }).catch(() => {});
      toast({ title: 'Hapus Masal Berhasil', description: `${idsToDelete.length} karya dipindahkan ke sampah.` });
      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Hapus Masal', description: friendlyDbError(err) });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [selectedIds, fetchData, toast]);

  // ============================================
  // DUPLIKAT & TOGGLE STATUS
  // ============================================

  /**
   * Duplikat karya memakai modul bersama post-actions (logika identik dengan
   * alat kelola inline di halaman publik). Hasil selalu draf nonaktif.
   */
  const handleDuplicate = useCallback(
    async (item: KaryaPost) => {
      if (isProcessingRef.current) return;
      setDuplicatingId(item.id);
      isProcessingRef.current = true;
      setIsProcessing(true);
      try {
        const res = await duplicatePostById(item.id);
        if (!res.ok) throw new Error(res.error);
        await logActivity({
          module: 'karya', action: 'duplicate', refType: 'products', refId: res.newId,
          summary: `Duplikat karya "${item.title}" (draf)`,
          before: [],
          after: [{ table: 'products', rows: [{ id: res.newId }] }],
          metadata: { primaryTable: 'products', childTables: [], refCol: 'product_id' },
        }).catch(() => {});
        toast({ title: 'Duplikat Dibuat', description: `"${item.title}" tersalin sebagai draf.` });
        await fetchData();
      } catch (err: unknown) {
        toast({ variant: 'destructive', title: 'Gagal Duplikat', description: friendlyDbError(err) });
      } finally {
        setDuplicatingId(null);
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [fetchData, toast]
  );

  const handleToggleActive = useCallback(
    async (item: KaryaPost) => {
      if (isProcessingRef.current) return;
      setTogglingId(item.id);
      isProcessingRef.current = true;
      setIsProcessing(true);
      try {
        const next = !item.is_active;
        const { error } = await supabase
          .from('products')
          .update({ is_active: next, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        if (error) throw error;
        await logActivity({
          module: 'karya', action: 'toggle_active', refType: 'products', refId: item.id,
          summary: `${next ? 'Tayangkan' : 'Arsipkan'} status karya "${item.title}"`,
          before: [{ table: 'products', rows: [{ id: item.id, ...karyaPostRow(item) }] }],
          metadata: { primaryTable: 'products', childTables: [], refCol: 'product_id' },
        }).catch(() => {});
        toast({
          title: next ? 'Karya Ditayangkan' : 'Karya Diarsipkan',
          description: item.title,
        });
        await fetchData();
      } catch (err: unknown) {
        toast({ variant: 'destructive', title: 'Gagal Ubah Status', description: friendlyDbError(err) });
      } finally {
        setTogglingId(null);
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [fetchData, toast]
  );

  // ============================================
  // SAMPAH: PULIHKAN & HAPUS PERMANEN
  // ============================================

  const handleRestore = useCallback(
    async (id: number) => {
      if (isProcessingRef.current) return;
      const snapItem = trashedItems.find((t) => t.id === id);
      isProcessingRef.current = true;
      setIsProcessing(true);
      try {
        const { error } = await supabase.from('products').update({ deleted_at: null }).eq('id', id);
        if (error) throw error;
        if (snapItem) {
          await logActivity({
            module: 'karya', action: 'restore', refType: 'products', refId: id,
            summary: `Pulihkan karya "${snapItem.title}"`,
            before: [{ table: 'products', rows: [karyaPostRow(snapItem)] }],
            metadata: { primaryTable: 'products', childTables: [], refCol: 'product_id' },
          }).catch(() => {});
        }
        toast({ title: 'Karya Dipulihkan', description: 'Karya kembali ke daftar utama sebagai draf.' });
        await fetchData();
      } catch (err: unknown) {
        toast({ variant: 'destructive', title: 'Gagal Memulihkan', description: friendlyDbError(err) });
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [fetchData, toast]
  );

  /** Hapus permanen: bersihkan aset Supabase Storage lalu baris relasi + induk. */
  const handlePermanentDelete = useCallback(async () => {
    if (!permanentDeleteId || isProcessingRef.current) return;
    const idToDelete = permanentDeleteId;
    setPermanentDeleteId(null);
    isProcessingRef.current = true;
    setIsProcessing(true);
    const target = trashedItems.find((t) => t.id === idToDelete);
    try {
      const urls = [
        ...((target?.images || []).map((i) => i.url_images)),
        ...(target?.gambar_thumbnail ? [target.gambar_thumbnail] : []),
      ];
      const publicIds = Array.from(
        new Set(urls.map((u) => getStoragePathFromUrl(u)).filter((pid): pid is string => !!pid))
      );
      await Promise.allSettled(publicIds.map((pid) => destroyStorageAsset(pid)));

      const [catDel, subDel, imgDel] = await Promise.all([
        supabase.from('product_categories').delete().eq('product_id', idToDelete),
        supabase.from('product_sub_categories').delete().eq('product_id', idToDelete),
        supabase.from('product_images').delete().eq('product_id', idToDelete),
      ]);
      if (catDel.error) throw catDel.error;
      if (subDel.error) throw subDel.error;
      if (imgDel.error) throw imgDel.error;

      const { error } = await supabase.from('products').delete().eq('id', idToDelete);
      if (error) throw error;

      if (target) {
        await logActivity({
          module: 'karya', action: 'delete', refType: 'products', refId: idToDelete,
          summary: `Hapus permanen karya "${target.title}"`,
          before: [{ table: 'products', rows: [karyaPostRow(target)] }, ...karyaChildSnapshots(target)],
          metadata: { primaryTable: 'products', childTables: ['product_categories', 'product_sub_categories', 'product_images'], refCol: 'product_id' },
        }).catch(() => {});
      }

      toast({ title: 'Karya Dihapus Permanen', description: target?.title });
      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Hapus Permanen', description: friendlyDbError(err) });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [permanentDeleteId, trashedItems, fetchData, toast]);

  const handlePermanentDeleteMany = useCallback(async (ids: number[]) => {
    if (isProcessingRef.current || ids.length === 0) return 0;
    isProcessingRef.current = true;
    setIsProcessing(true);
    const targets = trashedItems.filter((item) => ids.includes(item.id));
    const BATCH_SIZE = 3;
    let completed = 0;
    let failed = 0;

    try {
      for (let i = 0; i < targets.length; i += BATCH_SIZE) {
        const batch = targets.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(batch.map(async (target) => {
          const urls = [
            ...((target.images || []).map((image) => image.url_images)),
            ...(target.gambar_thumbnail ? [target.gambar_thumbnail] : []),
          ];
          const publicIds = Array.from(
            new Set(urls.map((url) => getStoragePathFromUrl(url)).filter((pid): pid is string => !!pid))
          );
          await Promise.allSettled(publicIds.map((pid) => destroyStorageAsset(pid)));

          const [catDel, subDel, imgDel] = await Promise.all([
            supabase.from('product_categories').delete().eq('product_id', target.id),
            supabase.from('product_sub_categories').delete().eq('product_id', target.id),
            supabase.from('product_images').delete().eq('product_id', target.id),
          ]);
          if (catDel.error) throw catDel.error;
          if (subDel.error) throw subDel.error;
          if (imgDel.error) throw imgDel.error;

          const { error } = await supabase.from('products').delete().eq('id', target.id).not('deleted_at', 'is', null);
          if (error) throw error;

          await logActivity({
            module: 'karya', action: 'delete', refType: 'products', refId: target.id,
            summary: `Hapus permanen karya "${target.title}" (masal)`,
            before: [{ table: 'products', rows: [karyaPostRow(target)] }, ...karyaChildSnapshots(target)],
            metadata: { primaryTable: 'products', childTables: ['product_categories', 'product_sub_categories', 'product_images'], refCol: 'product_id' },
          }).catch(() => {});
        }));
        for (const r of results) {
          if (r.status === 'fulfilled') completed++;
          else failed++;
        }
      }

      await fetchData();
      toast({
        title: 'Sampah Diproses',
        description: failed === 0
          ? `${completed} karya dihapus permanen.`
          : `${completed} berhasil, ${failed} gagal diproses.`,
        variant: failed === 0 ? 'default' : 'destructive',
      });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Hapus Massal', description: friendlyDbError(err) });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
    return completed;
  }, [trashedItems, fetchData, toast]);

  /** Pulihkan semua item sampah sekaligus. */
  const handleRestoreAll = useCallback(async () => {
    if (trashedItems.length === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const ids = trashedItems.map((item) => item.id);
      const { error } = await supabase.from('products').update({ deleted_at: null }).in('id', ids);
      if (error) throw error;
      await logActivity({
        module: 'karya', action: 'restore', refType: 'products',
        summary: `Pulihkan ${ids.length} karya (semua)`,
        before: [{ table: 'products', rows: trashedItems.map((i) => karyaPostRow(i)) }],
        metadata: { primaryTable: 'products', childTables: [], refCol: 'product_id' },
      }).catch(() => {});
      toast({ title: 'Semua Dipulihkan', description: `${ids.length} karya dikembalikan ke daftar utama sebagai draf.` });
      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Memulihkan', description: friendlyDbError(err) });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [trashedItems, fetchData, toast]);

  // ============================================
  // CROP (logika potong ada di useImageCropper; di sini hanya upload hasilnya)
  // ============================================

  const applyCrop = useCallback(async () => {
    const file = await extractCroppedFile((message) => {
      toast({ variant: 'destructive', title: 'Gagal Memproses', description: message });
    });
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await compressAndUpload(file, file.name);
      if (result) {
        setFormData((prev) => ({
          ...prev,
          gallery: [...prev.gallery, { url: result.url }],
        }));
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal Mengunggah',
          description: 'Gambar tidak dapat diunggah ke penyimpanan. Coba lagi.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah',
        description: 'Gambar tidak dapat diunggah ke penyimpanan. Coba lagi.',
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, [extractCroppedFile, toast]);

  const removeGalleryImage = useCallback((idx: number) => {
    setFormData((prev) => {
      // Aturan katalog: karya WAJIB menyisakan minimal 1 gambar.
      const next = prev.gallery.filter((_, i) => i !== idx);
      if (next.length === 0) return prev;
      return { ...prev, gallery: next };
    });
  }, []);

  // ============================================
  // DRAG & DROP REORDER
  // ============================================

  const reorderGallery = useCallback((oldIndex: number, newIndex: number) => {
    setFormData((prev) => {
      const newGallery = [...prev.gallery];
      const [moved] = newGallery.splice(oldIndex, 1);
      newGallery.splice(newIndex, 0, moved);
      return { ...prev, gallery: newGallery };
    });
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    items,
    trashedItems,
    categories,
    subCategories,
    loading,
    isProcessing,
    // Filter
    searchTerm,
    setSearchTerm,
    catFilter,
    setCatFilter,
    subCatFilter,
    setSubCatFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems,
    // Sampah
    isTrashOpen,
    setIsTrashOpen,
    permanentDeleteId,
    setPermanentDeleteId,
    handleRestore,
    handleRestoreAll,
    handlePermanentDelete,
    handlePermanentDeleteMany,
    // Form
    formData,
    setFormData,
    editingItem,
    isAdding,
    setIsAdding,
    isSubmitting,
    isUploadingImage,
    fieldErrors,
    showValidation,
    requestSave,
    isChanged,
    resetForm,
    startEdit,
    handleSave,
    // Duplikat & status
    duplicatingId,
    togglingId,
    handleDuplicate,
    handleToggleActive,
    // Delete
    deleteId,
    setDeleteId,
    selectedIds,
    setSelectedIds,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    handleSoftDelete,
    handleBulkDelete,
    // Crop
    cropState,
    setCropState,
    handleCropComplete,
    applyCrop,
    openCropDialog: openCropDialogRaw,
    removeGalleryImage,
    // Drag & Drop
    reorderGallery,
    // Refresh
    fetchData,
  };
}
