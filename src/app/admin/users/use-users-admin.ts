'use client';

/**
 * useUsersAdmin - Centralized state & business logic for admin users management.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { friendlyDbError } from '@/lib/db-errors';
import { logActivity } from '@/lib/activity-log';

// ============================================
// TYPES
// ============================================

export interface UserItem {
  id: number;
  username: string;
  full_name: string;
  role: 'staff' | 'admin' | 'developer';
  created_at: string;
}

export interface UserFormData {
  username: string;
  password: string;
  full_name: string;
  role: string;
}

/** Pesan validasi per-field form pengguna; undefined = valid. */
export interface UserFieldErrors {
  full_name?: string;
  username?: string;
  password?: string;
  role?: string;
}

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

/** Validasi murni form staf. Mode edit: password opsional (kosong = tetap). */
export function validateUserForm(data: UserFormData, isEdit = false): UserFieldErrors {
  const errors: UserFieldErrors = {};
  if (!data.full_name.trim()) {
    errors.full_name = 'Nama lengkap wajib diisi.';
  }
  const username = data.username.trim().toLowerCase();
  if (!username) {
    errors.username = 'ID pengguna wajib diisi.';
  } else if (!USERNAME_RE.test(username)) {
    errors.username = 'Huruf kecil/angka/underscore, 3-30 karakter.';
  }
  if (isEdit) {
    if (data.password && data.password.length < 6) {
      errors.password = 'Minimal 6 karakter.';
    }
  } else if (!data.password) {
    errors.password = 'Kode rahasia wajib diisi.';
  } else if (data.password.length < 6) {
    errors.password = 'Minimal 6 karakter.';
  }
  if (!['staff', 'admin', 'developer'].includes(data.role)) {
    errors.role = 'Pilih otoritas sistem.';
  }
  return errors;
}

// ============================================
// HOOK
// ============================================

export interface UsersAdminInitialState {
  searchTerm?: string;
  currentPage?: number;
}

export function useUsersAdmin(initial: UsersAdminInitialState = {}) {
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Data
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('');

  // Form
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Validasi inline (tampil di dalam modal, bukan toast)
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({});
  const [showValidation, setShowValidation] = useState(false);

// Filter
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm ?? '');
  const [currentPage, setCurrentPage] = useState(() => {
    const p = initial.currentPage ?? 1;
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Delete
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    full_name: '',
    role: 'staff',
  });

  // ============================================
  // INIT
  // ============================================

  useEffect(() => {
    setCurrentUserRole(localStorage.getItem('fee_user_role') || '');
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_team_members');
      if (error) throw error;
      setUsers((data || []) as UserItem[]);
    } catch (err: unknown) {
      console.error('Fetch Users Error:', err);
      toast({
        variant: 'destructive',
        title: 'Sinkronisasi Gagal',
        description: friendlyDbError(err),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // FILTERING & PAGINATION
  // ============================================

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.username?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Reset ke halaman 1 saat pencarian berubah — tapi bukan pada render
  // pertama, agar ?page=N tetap bertahan saat refresh.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchTerm]);

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

  // Bersihkan validasi saat modal ditutup
  useEffect(() => {
    if (!isAdding) {
      setShowValidation(false);
      setFieldErrors({});
    }
  }, [isAdding]);

  // Live re-validasi: pesan hilang begitu field diperbaiki
  useEffect(() => {
    if (showValidation) {
      setFieldErrors(validateUserForm(formData, !!editingUser));
    }
  }, [formData, showValidation, editingUser]);

  /**
   * Dipanggil tombol simpan. Return true = valid (handleSave boleh
   * dieksekusi), false = tampilkan error inline di modal.
   */
  const requestSave = useCallback((): boolean => {
    const errors = validateUserForm(formData, !!editingUser);
    setFieldErrors(errors);
    setShowValidation(true);
    return Object.keys(errors).length === 0;
  }, [formData, editingUser]);

  // ============================================
  // SAVE
  // ============================================

  const handleSave = useCallback(async () => {
    if (isProcessingRef.current) return;
    // Safety-net: validasi ulang sebelum menyimpan
    const errors = validateUserForm(formData, !!editingUser);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowValidation(true);
      return;
    }
    setSubmitting(true);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      if (editingUser) {
        // EDIT: password hanya dikirim bila diisi (trigger DB otomatis bcrypt)
        const payload: Record<string, unknown> = {
          username: formData.username.trim().toLowerCase(),
          full_name: formData.full_name,
          role: formData.role,
        };
        if (formData.password) payload.password = formData.password;

        const { error } = await supabase.from('users').update(payload).eq('id', editingUser.id);
        if (error) throw error;
        await logActivity({
          module: 'users', action: 'update', refType: 'users', refId: editingUser.id,
          summary: `Ubah anggota "${editingUser.full_name}"`,
          before: [{ table: 'users', rows: [{ ...editingUser }] }],
          metadata: { primaryTable: 'users', childTables: [], refCol: 'id' },
        }).catch(() => {});
        toast({ title: 'Perubahan Disimpan', description: `Data ${editingUser.full_name} telah diperbarui.` });
      } else {
        // CREATE: trigger DB hash_password_trigger mengubah plaintext -> bcrypt
        const { data: inserted, error } = await supabase.from('users').insert([
          {
            username: formData.username.trim().toLowerCase(),
            password: formData.password,
            full_name: formData.full_name,
            role: formData.role,
          },
        ]).select().single();
        if (error) throw error;
        const newId = inserted?.id as number | undefined;
        await logActivity({
          module: 'users', action: 'create', refType: 'users', refId: newId,
          summary: `Daftarkan anggota "${formData.full_name}"`,
          before: [],
          after: newId ? [{ table: 'users', rows: [{ id: newId, username: formData.username.trim().toLowerCase(), full_name: formData.full_name, role: formData.role }] }] : [],
          metadata: { primaryTable: 'users', childTables: [], refCol: 'id' },
        }).catch(() => {});
        toast({ title: 'Registrasi Berhasil', description: 'Anggota tim telah diaktifkan.' });
      }

      // Tutup dialog terlebih dahulu agar DOM ringan sebelum fetchData
      setIsAdding(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', full_name: '', role: 'staff' });
      setShowValidation(false);
      setFieldErrors({});

      await fetchData();
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: friendlyDbError(err),
      });
    } finally {
      setSubmitting(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [formData, editingUser, fetchData, toast]);

  /** Buka modal dalam mode edit dengan data staf terisi. */
  const startEdit = useCallback((user: UserItem) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      role: user.role || 'staff',
    });
    setIsAdding(true);
  }, []);

  // ============================================
  // DELETE
  // ============================================

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId || isProcessingRef.current) return;
    // Proteksi: hanya developer boleh menghapus akun developer
    const target = users.find((u) => u.id === deleteConfirmId);
    if (target?.role === 'developer' && currentUserRole !== 'developer') {
      toast({ variant: 'destructive', title: 'Akses Ditolak', description: 'Hanya SYSTEM DEVELOPER yang dapat menghapus akun developer.' });
      setDeleteConfirmId(null);
      return;
    }
    setSubmitting(true);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('users').delete().eq('id', deleteConfirmId);
      if (error) throw error;
      if (target) {
        await logActivity({
          module: 'users', action: 'delete', refType: 'users', refId: deleteConfirmId,
          summary: `Hapus anggota "${target.full_name}"`,
          before: [{ table: 'users', rows: [{ ...target }] }],
          metadata: { primaryTable: 'users', childTables: [], refCol: 'id' },
        }).catch(() => {});
      }
      toast({ title: 'Terhapus', description: 'Personel telah dikeluarkan.' });
      await fetchData();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Hapus', description: friendlyDbError(err) });
    } finally {
      setDeleteConfirmId(null);
      setSubmitting(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [deleteConfirmId, users, currentUserRole, fetchData, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (isProcessingRef.current) return;
    // Proteksi: hanya developer boleh menghapus akun developer
    if (currentUserRole !== 'developer' && selectedIds.some((id) => users.find((u) => u.id === id)?.role === 'developer')) {
      toast({ variant: 'destructive', title: 'Akses Ditolak', description: 'Hanya SYSTEM DEVELOPER yang dapat menghapus akun developer.' });
      setBulkDeleteConfirm(false);
      return;
    }
    setSubmitting(true);
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('users').delete().in('id', selectedIds);
      if (error) throw error;
      const bulkTargets = users.filter((u) => selectedIds.includes(u.id));
      await logActivity({
        module: 'users', action: 'delete', refType: 'users',
        summary: `Hapus ${selectedIds.length} anggota (masal)`,
        before: [{ table: 'users', rows: bulkTargets.map((u) => ({ ...u })) }],
        metadata: { primaryTable: 'users', childTables: [], refCol: 'id' },
      }).catch(() => {});
      toast({ title: 'Pembersihan Selesai', description: 'Tim pilihan telah dihapus.' });
      await fetchData();
      setSelectedIds([]);
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Hapus Massal', description: friendlyDbError(err) });
    } finally {
      setBulkDeleteConfirm(false);
      setSubmitting(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [selectedIds, users, currentUserRole, fetchData, toast]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    users,
    loading,
    currentUserRole,
    // Filter
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredUsers,
    paginatedUsers,
    // Selection
    selectedIds,
    setSelectedIds,
    // Form
    formData,
    setFormData,
    isAdding,
    setIsAdding,
    editingUser,
    setEditingUser,
    startEdit,
    submitting,
    isProcessing,
    fieldErrors,
    requestSave,
    handleSave,
    // Delete
    deleteConfirmId,
    setDeleteConfirmId,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    handleDeleteConfirm,
    handleBulkDelete,
    // Refresh
    fetchData,
  };
}
