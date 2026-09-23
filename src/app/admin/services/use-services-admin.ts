'use client';

/**
 * useServicesAdmin - Centralized state & business logic for admin services (categories & sub-categories).
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { friendlyDbError } from '@/lib/db-errors';
import { logActivity } from '@/lib/activity-log';

// ============================================
// TYPES
// ============================================

export type ServicesTab = 'categories' | 'sub_categories';

export interface CategoryItem {
  id: number;
  name: string;
  is_active?: boolean;
  deleted_at?: string | null;
}

export interface SubCategoryItem {
  id: number;
  name: string;
  category_id: number;
  price?: number;
  deleted_at?: string | null;
  categories?: { name: string };
}

export type ServiceItem = CategoryItem | SubCategoryItem;

export interface ServiceFormData {
  name: string;
  category_id: string;
  price: string;
  is_active: boolean;
}

/** Pesan validasi per-field form katalog; undefined = valid. */
export interface ServiceFieldErrors {
  name?: string;
  category_id?: string;
  price?: string;
}

/** Validasi murni form katalog sesuai tab aktif. */
export function validateServiceForm(
  data: ServiceFormData,
  activeTab: ServicesTab
): ServiceFieldErrors {
  const errors: ServiceFieldErrors = {};
  if (!data.name.trim()) {
    errors.name = 'Nama wajib diisi.';
  }
  if (activeTab === 'sub_categories') {
    if (!data.category_id) {
      errors.category_id = 'Pilih kategori induk.';
    }
    const price = parseFloat(data.price || '0');
    if (data.price.trim() === '' || Number.isNaN(price)) {
      errors.price = 'Harga harus berupa angka.';
    } else if (price < 0) {
      errors.price = 'Harga tidak boleh negatif.';
    }
  }
  return errors;
}

// ============================================
// HOOK
// ============================================

export interface ServicesAdminInitialState {
  activeTab?: ServicesTab;
  searchTerm?: string;
  currentPage?: number;
}

export function useServicesAdmin(initial: ServicesAdminInitialState = {}) {
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Tabs
  const [activeTab, setActiveTab] = useState<ServicesTab>(initial.activeTab ?? 'categories');

  // Data
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

  // Validasi inline (tampil di dalam modal, bukan toast)
  const [fieldErrors, setFieldErrors] = useState<ServiceFieldErrors>({});
  const [showValidation, setShowValidation] = useState(false);

  // Filter
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm ?? '');
  const [currentPage, setCurrentPage] = useState(() => {
    const p = initial.currentPage ?? 1;
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ServiceFormData>({ name: '', category_id: '', price: '0', is_active: true });

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Hanya item aktif (belum soft-delete) yang dikelola di panel
      const { data: cats } = await supabase.from('categories').select('*').is('deleted_at', null).order('name').limit(10000);
      setCategories((cats || []) as CategoryItem[]);

      const table = activeTab === 'categories' ? 'categories' : 'sub_categories';
      const select = activeTab === 'categories' ? '*' : '*, categories(name)';
      const { data, error } = await supabase.from(table).select(select).is('deleted_at', null).order('name').limit(10000);
      if (error) throw error;
      setItems((data || []) as unknown as ServiceItem[]);
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal', description: friendlyDbError(err) });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchData();
    setSelectedIds([]);
  }, [fetchData]);

  // ============================================
  // FILTERING & PAGINATION
  // ============================================

  const filteredItems = useMemo(
    () => items.filter((i) => i.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [items, searchTerm]
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Reset ke halaman 1 saat pencarian/tab berubah — tapi bukan pada render
  // pertama, agar ?page=N & ?tab= tetap bertahan saat refresh.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Clamp currentPage: hanya setelah data selesai dimuat (loading=false),
  // agar ?page=5 tidak di-reset ke 1 saat totalPages masih 1 di awal load.
  useEffect(() => {
    if (loading) return;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, loading]);

  // ============================================
  // FORM VALIDATION
  // ============================================

  // Bersihkan validasi saat modal ditutup / pindah tab
  useEffect(() => {
    if (!isAdding) {
      setShowValidation(false);
      setFieldErrors({});
    }
  }, [isAdding, activeTab]);

  // Live re-validasi: pesan hilang begitu field diperbaiki
  useEffect(() => {
    if (showValidation) {
      setFieldErrors(validateServiceForm(formData, activeTab));
    }
  }, [formData, showValidation, activeTab]);

  /**
   * Dipanggil tombol simpan. Return true = valid (dan handleSave
   * boleh dieksekusi), false = tampilkan error inline di modal.
   */
  const requestSave = useCallback((): boolean => {
    const errors = validateServiceForm(formData, activeTab);
    setFieldErrors(errors);
    setShowValidation(true);
    return Object.keys(errors).length === 0;
  }, [formData, activeTab]);

  // ============================================
  // SAVE
  // ============================================

  const handleSave = useCallback(async () => {
    if (isProcessingRef.current) return;
    // Safety-net: validasi ulang sebelum menyimpan
    const errors = validateServiceForm(formData, activeTab);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowValidation(true);
      return;
    }
    setIsSubmitting(true);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const table = activeTab === 'categories' ? 'categories' : 'sub_categories';
      const payload: Record<string, unknown> = {
        name: formData.name,
        is_active: formData.is_active,
      };
      if (activeTab === 'sub_categories') {
        payload.category_id = parseInt(formData.category_id);
        payload.price = parseFloat(formData.price || '0');
      }

      if (editingItem) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingItem.id);
        if (error) throw error;
        await logActivity({
          module: 'services', action: 'update', refType: table, refId: editingItem.id,
          summary: `Ubah ${table === 'categories' ? 'kategori' : 'sub-kategori'} "${editingItem.name}"`,
          before: [{ table, rows: [{ ...editingItem }] }],
          metadata: { primaryTable: table, childTables: [], refCol: 'id' },
        }).catch(() => {});
        toast({ title: 'Berhasil', description: 'Basis data telah diperbarui.' });
      } else {
        const { data: inserted, error } = await supabase.from(table).insert([payload]).select().single();
        if (error) throw error;
        const newId = inserted?.id as number | undefined;
        await logActivity({
          module: 'services', action: 'create', refType: table, refId: newId,
          summary: `Buat ${table === 'categories' ? 'kategori' : 'sub-kategori'} "${formData.name}"`,
          before: [],
          after: [{ table, rows: newId ? [{ ...payload, id: newId }] : [] }],
          metadata: { primaryTable: table, childTables: [], refCol: 'id' },
        }).catch(() => {});
        toast({ title: 'Berhasil', description: 'Item baru telah ditambahkan.' });
      }
      // Tutup dialog terlebih dahulu agar DOM ringan sebelum fetchData
      setIsAdding(false);
      setEditingItem(null);

      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal', description: friendlyDbError(err) });
    } finally {
      setIsSubmitting(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [activeTab, formData, editingItem, fetchData, toast]);

  // ============================================
  // DELETE
  // ============================================

  const checkUsage = useCallback(
    async (ids: number[]): Promise<boolean> => {
      const table = activeTab === 'categories' ? 'product_categories' : 'product_sub_categories';
      const column = activeTab === 'categories' ? 'category_id' : 'sub_category_id';
      const { data } = await supabase.from(table).select(column).in(column, ids);
      return !!(data && data.length > 0);
    },
    [activeTab]
  );

  const handleDeleteTrigger = useCallback(
    async (id: number) => {
      if (isProcessingRef.current) return;
      const inUse = await checkUsage([id]);
      if (inUse) {
        toast({
          variant: 'destructive',
          title: 'Proteksi Data Shield',
          description: 'Gagal! Item ini masih digunakan oleh galeri karya.',
        });
        return;
      }
      setDeleteId(id);
    },
    [checkUsage, toast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId || isProcessingRef.current) return;
    setIsSubmitting(true);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const table = activeTab === 'categories' ? 'categories' : 'sub_categories';
      const target = items.find((i) => i.id === deleteId);
      const { error } = await supabase.from(table).delete().eq('id', deleteId);
      if (error) throw error;
      if (target) {
        await logActivity({
          module: 'services', action: 'delete', refType: table, refId: deleteId,
          summary: `Hapus ${table === 'categories' ? 'kategori' : 'sub-kategori'} "${target.name}"`,
          before: [{ table, rows: [{ ...target }] }],
          metadata: { primaryTable: table, childTables: [], refCol: 'id' },
        }).catch(() => {});
      }
      toast({ title: 'Terhapus', description: 'Item telah dibersihkan dari arsip.' });
      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal', description: friendlyDbError(err) });
    } finally {
      setDeleteId(null);
      setIsSubmitting(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [deleteId, activeTab, fetchData, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (isProcessingRef.current) return;
    setIsSubmitting(true);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const inUse = await checkUsage(selectedIds);
      if (inUse) {
        toast({
          variant: 'destructive',
          title: 'Proteksi Data Shield',
          description: 'Gagal! Beberapa item masih digunakan oleh galeri karya.',
        });
        return;
      }
      const table = activeTab === 'categories' ? 'categories' : 'sub_categories';
      const targets = items.filter((i) => selectedIds.includes(i.id));
      const { error } = await supabase.from(table).delete().in('id', selectedIds);
      if (error) throw error;
      await logActivity({
        module: 'services', action: 'delete', refType: table,
        summary: `Hapus ${targets.length} ${table === 'categories' ? 'kategori' : 'sub-kategori'} (masal)`,
        before: [{ table, rows: targets.map((t) => ({ ...t })) }],
        metadata: { primaryTable: table, childTables: [], refCol: 'id' },
      }).catch(() => {});
      toast({ title: 'Berhasil', description: 'Katalog pilihan telah dibersihkan.' });
      await fetchData();
      setSelectedIds([]);
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal', description: friendlyDbError(err) });
    } finally {
      setBulkDeleteConfirm(false);
      setIsSubmitting(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [selectedIds, activeTab, checkUsage, fetchData, toast]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Tabs
    activeTab,
    setActiveTab,
    // Data
    items,
    categories,
    loading,
    // Filter
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems,
    // Selection
    selectedIds,
    setSelectedIds,
    // Form
    formData,
    setFormData,
    editingItem,
    setEditingItem,
    isAdding,
    setIsAdding,
    isSubmitting,
    isProcessing,
    fieldErrors,
    requestSave,
    handleSave,
    // Delete
    deleteId,
    setDeleteId,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    handleDeleteTrigger,
    handleDeleteConfirm,
    handleBulkDelete,
    // Refresh
    fetchData,
  };
}
