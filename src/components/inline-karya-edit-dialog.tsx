'use client';

/**
 * InlineKaryaEditDialog - Editor "Edit Karya" di halaman publik (beranda,
 * galeri, detail). Sekarang hanya menjadi PEMBUNGKUS tipis dari KaryaFormDialog
 * (komponen yang sama persis dengan Manajemen Karya admin) agar desain &
 * perilaku modal identik di mana pun dibuka. Logika fetch/simpan data POST
 * tetap milik pembungkus ini (edit satu karya dari objek yang sudah tersedia).
 *
 * Perbaikan tambahan dari versi lama: crop GUI kini benar-benar tampil
 * (react-easy-crop via KaryaFormDialog) dan validasi muncul inline dalam modal.
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { compressAndUpload, destroyCloudinaryAsset, getPublicIdFromUrl } from '@/lib/image-upload';
import { KaryaFormDialog } from '@/components/karya-form-dialog';
import { useImageCropper } from '@/hooks/use-image-cropper';
import {
  validatePostForm,
  RATIOS,
  type PostFormData,
  type CategoryEntry,
  type SubCategoryEntry,
  type FieldErrors,
} from '@/app/admin/karya/use-karya-admin';

interface EditablePost {
  id: number | string;
  title: string;
  price?: number;
  deskripsi?: string;
  gambar_thumbnail?: string;
  is_active?: boolean;
  images?: { url_images: string }[];
  categories?: { id: number; name: string }[];
  sub_categories?: { id: number; name: string }[];
}

interface InlineKaryaEditDialogProps {
  post: EditablePost | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: (post: EditablePost) => void;
}

const RESET_CROP_ASPECT = 3 / 4;

const EMPTY_FORM: PostFormData = {
  title: '',
  price: '0',
  deskripsi: '',
  gallery: [],
  category_ids: [],
  sub_category_ids: [],
  is_active: true,
};

const toForm = (post: EditablePost): PostFormData => {
  const urls = (post.images || []).map((img) => img.url_images).filter(Boolean);
  return {
    title: post.title || '',
    price: String(post.price || 0),
    deskripsi: post.deskripsi || '',
    is_active: post.is_active ?? true,
    gallery: urls.map((u) => ({ url: u })),
    // Aturan katalog: 1 karya = 1 kategori + 1 sub kategori (ambil pilihan pertama).
    category_ids: (post.categories || []).slice(0, 1).map((c) => c.id),
    sub_category_ids: (post.sub_categories || []).slice(0, 1).map((sc) => sc.id),
  };
};

/** Checksum urutan galeri — dipakai membandingkan "pernah diubah?" (ikon tombol Simpan). */
function galleryChecksum(urls: string[]): string {
  return urls
    .map((url, i) => {
      const start = url.lastIndexOf('/') + 1;
      return `${i}:${url.substring(start, start + 40)}`;
    })
    .join('|');
}

export const InlineKaryaEditDialog: React.FC<InlineKaryaEditDialogProps> = ({ post, onOpenChange, onSaved }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<PostFormData | null>(() => (post ? toForm(post) : null));
  const [originalGallery, setOriginalGallery] = useState<string[]>(
    () => (post ? toForm(post).gallery.map((g) => g.url) : [])
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const {
    cropState,
    setCropState,
    openCropDialog,
    handleCropComplete,
    resetCrop,
    applyCrop: extractCroppedFile,
  } = useImageCropper(RESET_CROP_ASPECT);
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryEntry[]>([]);

  // Reset form saat post berubah DENGAN pola React "adjust state during render":
  // berjalan sebelum commit sehingga TIDAK ada flash body kosong pada frame pertama,
  // dan tanpa remount dialog (state kategori/subkategori tetap bertahan).
  const prevPostIdRef = useRef<string | null>(null);
  const currentPostId = post ? String(post.id) : null;
  if (currentPostId !== prevPostIdRef.current) {
    prevPostIdRef.current = currentPostId;
    if (post) {
      const f = toForm(post);
      setForm(f);
      setOriginalGallery(f.gallery.map((g) => g.url));
    } else {
      setForm(null);
      setOriginalGallery([]);
    }
  }

  // Bersihkan errror crop lama ketika target karya berganti / dialog ditutup.
  useEffect(() => {
    setFieldErrors({});
    resetCrop();
  }, [currentPostId, resetCrop]);

  // Muat daftar kategori + subkategori setiap dialog terbuka.
  useEffect(() => {
    if (!post) return;
    (async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          supabase.from('categories').select('id, name').is('is_active', true).order('name').limit(1000),
          supabase.from('sub_categories').select('id, name, category_id').is('deleted_at', null).order('name').limit(1000),
        ]);
        setCategories((catRes.data || []) as CategoryEntry[]);
        setSubCategories((subRes.data || []) as SubCategoryEntry[]);
      } catch (err) {
        console.error('Gagal memuat kategori editor:', err);
        setCategories([]);
        setSubCategories([]);
      }
    })();
  }, [post]);

  // Tombol Simpan nonaktif hingga ada perubahan nyata (konsisten dgn admin).
  const isChanged = useMemo(() => {
    if (!post || !form) return false;
    if (form.title !== (post.title || '')) return true;
    if (parseFloat(form.price || '0') !== (post.price || 0)) return true;
    if ((form.deskripsi || '') !== (post.deskripsi || '')) return true;
    if (form.is_active !== (post.is_active ?? true)) return true;
    const oldCats = [...(post.categories || []).map((c) => c.id)].sort();
    const newCats = [...form.category_ids].sort();
    if (JSON.stringify(oldCats) !== JSON.stringify(newCats)) return true;
    const oldSubs = [...(post.sub_categories || []).map((s) => s.id)].sort();
    const newSubs = [...form.sub_category_ids].sort();
    if (JSON.stringify(oldSubs) !== JSON.stringify(newSubs)) return true;
    if (form.gallery.length !== (post.images?.length || 0)) return true;
    return galleryChecksum(form.gallery.map((g) => g.url)) !== galleryChecksum((post.images || []).map((img) => img.url_images));
  }, [form, post]);

  // ============================================
  // CROP & UPLOAD (logika potong dibagi via useImageCropper)
  // ============================================

  const applyCrop = useCallback(async () => {
    const file = await extractCroppedFile((message) => {
      toast({ variant: 'destructive', title: 'Gagal Memproses', description: message });
    });
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await compressAndUpload(file, file.name);
      if (result) {
        setForm((prev) => {
          if (!prev || prev.gallery.length >= 5) return prev;
          return { ...prev, gallery: [...prev.gallery, { url: result.url }] };
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal Mengunggah',
          description: 'Gambar tidak dapat diunggah ke Cloudinary. Coba lagi.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah',
        description: 'Gambar tidak dapat diunggah ke Cloudinary. Coba lagi.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [extractCroppedFile, toast]);

  const removeGalleryImage = useCallback((idx: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      // Aturan katalog: karya wajib menyisakan minimal 1 gambar.
      const next = prev.gallery.filter((_, i) => i !== idx);
      if (next.length === 0) return prev;
      return { ...prev, gallery: next };
    });
  }, []);

  const reorderGallery = useCallback((oldIndex: number, newIndex: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const newGallery = [...prev.gallery];
      const [moved] = newGallery.splice(oldIndex, 1);
      newGallery.splice(newIndex, 0, moved);
      return { ...prev, gallery: newGallery };
    });
  }, []);

  // ============================================
  // SAVE
  // ============================================

  const handleSave = async () => {
    if (!post || !form) return;

    // Safety-net: validasi ulang sebelum menyimpan ke server
    const errors = validatePostForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const title = form.title.trim();
      const price = parseFloat(form.price || '0');
      const deskripsi = form.deskripsi.trim();
      const finalUrls = form.gallery.map((g) => g.url);
      const galleryChanged = galleryChecksum(finalUrls) !== galleryChecksum(originalGallery);

      const { error: postErr } = await supabase
        .from('products')
        .update({
          title,
          price,
          deskripsi,
          is_active: form.is_active,
          // Kolom FK langsung untuk halaman detail publik: subkategori pertama = utama
          sub_category_id: form.sub_category_ids.length > 0 ? form.sub_category_ids[0] : null,
          gambar_thumbnail: finalUrls[0] || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)
        .is('deleted_at', null);
      if (postErr) throw postErr;

      // Sinkronkan relasi kategori & subkategori (hapus dulu lalu sisipkan ulang)
      const [catDel, subDel] = await Promise.all([
        supabase.from('product_categories').delete().eq('product_id', post.id),
        supabase.from('product_sub_categories').delete().eq('product_id', post.id),
      ]);
      if (catDel.error) throw catDel.error;
      if (subDel.error) throw subDel.error;
      if (form.category_ids.length > 0) {
        const { error } = await supabase
          .from('product_categories')
          .insert(form.category_ids.map((category_id) => ({ product_id: Number(post.id), category_id })));
        if (error) throw error;
      }
      if (form.sub_category_ids.length > 0) {
        const { error } = await supabase
          .from('product_sub_categories')
          .insert(form.sub_category_ids.map((sub_category_id) => ({ product_id: Number(post.id), sub_category_id })));
        if (error) throw error;
      }

      // Galeri: hapus aset Cloudinary yang dibuang, lalu tulis ulang product_images.
      if (galleryChanged) {
        const removedUrls = originalGallery.filter((url) => !finalUrls.includes(url));
        const publicIds = removedUrls.map((url) => getPublicIdFromUrl(url)).filter((pid): pid is string => !!pid);
        await Promise.allSettled(publicIds.map((pid) => destroyCloudinaryAsset(pid)));

        await supabase.from('product_images').delete().eq('product_id', post.id);

        if (finalUrls.length > 0) {
          const { error: imgErr } = await supabase
            .from('product_images')
            .insert(finalUrls.map((url, i) => ({ product_id: Number(post.id), url_images: url, urutan: i })));
          if (imgErr) throw imgErr;
        }
      }

      const updatedCategories = categories.filter((c) => form.category_ids.includes(c.id)).map((c) => ({ id: c.id, name: c.name }));
      const updatedSubCategories = subCategories.filter((sc) => form.sub_category_ids.includes(sc.id)).map((sc) => ({ id: sc.id, name: sc.name }));
      onSaved?.({
        ...post,
        title,
        price,
        deskripsi,
        is_active: form.is_active,
        gambar_thumbnail: finalUrls[0],
        images: finalUrls.map((url) => ({ url_images: url })),
        categories: updatedCategories,
        sub_categories: updatedSubCategories,
      } as EditablePost);
      toast({ title: 'Karya Diperbarui', description: 'Semua perubahan berhasil disimpan.' });
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan karya',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan perubahan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Validasi inline DI DALAM modal (sama seperti admin): banner + hint merah.
  const requestSave = useCallback((): boolean => {
    if (!form) return false;
    const errors = validatePostForm(form);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  return (
    <KaryaFormDialog
      isOpen={post !== null}
      onOpenChange={onOpenChange}
      editingItem={post ? { id: Number(post.id), title: post.title } : null}
      formData={form ?? EMPTY_FORM}
      setFormData={(updater) => {
        setForm((prev) => {
          if (!prev) return prev;
          return typeof updater === 'function' ? updater(prev) : updater;
        });
      }}
      categories={categories}
      subCategories={subCategories}
      isSubmitting={isSaving}
      isUploadingImage={isUploading}
      isChanged={isChanged}
      fieldErrors={fieldErrors}
      onSave={() => {
        if (requestSave()) void handleSave();
      }}
      cropState={cropState}
      setCropState={setCropState}
      onCropComplete={handleCropComplete}
      onApplyCrop={applyCrop}
      onOpenCropDialog={openCropDialog}
      onRemoveImage={removeGalleryImage}
      onReorderGallery={reorderGallery}
      ratios={RATIOS}
    />
  );
};