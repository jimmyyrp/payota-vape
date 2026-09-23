'use client';

/**
 * useTestimonialsAdmin - Centralized state & business logic for admin reviews management.
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/activity-log';

// ============================================
// TYPES
// ============================================

export interface ReviewItem {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  deleted_at?: string | null;
  created_at?: string;
}

/** Data form edit ulasan. */
export interface ReviewFormData {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface TokenItem {
  id: number;
  token: string;
  usage_limit: number;
  usage_count: number;
  created_at?: string;
}

// ============================================
// HOOK
// ============================================

export function useTestimonialsAdmin() {
  const { toast } = useToast();

  // Data
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Token form
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [usageLimit, setUsageLimit] = useState(1);

  // Edit review
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({ name: '', role: '', text: '', rating: 5 });

  // Delete
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
  const [deleteTokenId, setDeleteTokenId] = useState<number | null>(null);

  // Copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revs, toks] = await Promise.all([
        supabase.from('reviews').select('*').is('deleted_at', null).order('id', { ascending: false }).limit(10000),
        supabase.from('review_tokens').select('*').order('id', { ascending: false }).limit(10000),
      ]);
      if (revs.error) throw revs.error;
      if (toks.error) throw toks.error;
      setReviews((revs.data || []) as ReviewItem[]);
      setTokens((toks.data || []) as TokenItem[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data testimoni.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // TOKEN GENERATION
  // ============================================

  const generateToken = useCallback(async () => {
    setIsSubmitting(true);
    const token = Math.random().toString(36).substring(2, 10);
    const { data: inserted, error } = await supabase.from('review_tokens').insert([
      { token, usage_limit: usageLimit, usage_count: 0 },
    ]).select().single();

    if (error) {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    } else {
      const newId = inserted?.id as number | undefined;
      await logActivity({
        module: 'reviews', action: 'create', refType: 'review_tokens', refId: newId,
        summary: `Terbitkan tautan ulasan (kuota ${usageLimit})`,
        before: [],
        after: newId ? [{ table: 'review_tokens', rows: [{ id: newId, token, usage_limit: usageLimit, usage_count: 0 }] }] : [],
        metadata: { primaryTable: 'review_tokens', childTables: [], refCol: 'id' },
      }).catch(() => {});
      toast({ title: 'Tautan Aktif', description: 'Akses ulasan berhasil diaktifkan.' });
      setIsAddingToken(false);
      setUsageLimit(1);
      await fetchData();
    }
    setIsSubmitting(false);
  }, [usageLimit, fetchData, toast]);

  // ============================================
  // COPY LINK
  // ============================================

  const copyLink = useCallback(
    (token: string) => {
      const url = `${window.location.origin}/review/${token}`;
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      toast({ title: 'Disalin', description: 'Tautan siap dibagikan.' });
      setTimeout(() => setCopiedToken(null), 2000);
    },
    [toast]
  );

  // ============================================
  // EDIT REVIEW
  // ============================================

  /** Buka modal edit ulasan dengan data terisi. */
  const startEditReview = useCallback((r: ReviewItem) => {
    setEditingReview(r);
    setReviewForm({ name: r.name, role: r.role || '', text: r.text, rating: Math.min(5, Math.max(1, r.rating || 5)) });
  }, []);

  const closeEditReview = useCallback(() => {
    setEditingReview(null);
    setReviewForm({ name: '', role: '', text: '', rating: 5 });
  }, []);

  const handleSaveReview = useCallback(async () => {
    if (!editingReview) return;
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      toast({ variant: 'destructive', title: 'Data Kurang', description: 'Nama dan isi ulasan wajib diisi.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          name: reviewForm.name.trim(),
          role: reviewForm.role.trim() || 'Klien Vape Store',
          text: reviewForm.text.trim(),
          rating: Math.min(5, Math.max(1, Math.round(reviewForm.rating || 5))),
        })
        .eq('id', editingReview.id);
      if (error) throw error;
      if (editingReview) {
        await logActivity({
          module: 'reviews', action: 'update', refType: 'reviews', refId: editingReview.id,
          summary: `Ubah ulasan "${editingReview.name}"`,
          before: [{ table: 'reviews', rows: [{ ...editingReview }] }],
          metadata: { primaryTable: 'reviews', childTables: [], refCol: 'id' },
        }).catch(() => {});
      }
      toast({ title: 'Ulasan Diperbarui', description: 'Perubahan ulasan telah disimpan.' });
      closeEditReview();
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan ulasan.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingReview, reviewForm, closeEditReview, fetchData, toast]);

  // ============================================
  // DELETE REVIEW
  // ============================================

  const handleDeleteReview = useCallback(async () => {
    if (!deleteReviewId) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', deleteReviewId);
      if (error) throw error;
      const revTarget = reviews.find((r) => r.id === deleteReviewId);
      if (revTarget) {
        await logActivity({
          module: 'reviews', action: 'delete', refType: 'reviews', refId: deleteReviewId,
          summary: `Hapus ulasan "${revTarget.name}"`,
          before: [{ table: 'reviews', rows: [{ ...revTarget }] }],
          metadata: { primaryTable: 'reviews', childTables: [], refCol: 'id' },
        }).catch(() => {});
      }
      toast({ title: 'Terhapus', description: 'Ulasan dibersihkan & kuota dikembalikan.' });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus ulasan.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setDeleteReviewId(null);
      setIsSubmitting(false);
    }
  }, [deleteReviewId, fetchData, toast]);

  // ============================================
  // DELETE TOKEN
  // ============================================

  const handleDeleteToken = useCallback(async () => {
    if (!deleteTokenId) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('review_tokens').delete().eq('id', deleteTokenId);
      if (error) throw error;
      const tokTarget = tokens.find((t) => t.id === deleteTokenId);
      if (tokTarget) {
        await logActivity({
          module: 'reviews', action: 'delete', refType: 'review_tokens', refId: deleteTokenId,
          summary: `Cabut tautan ulasan "${tokTarget.token}"`,
          before: [{ table: 'review_tokens', rows: [{ ...tokTarget }] }],
          metadata: { primaryTable: 'review_tokens', childTables: [], refCol: 'id' },
        }).catch(() => {});
      }
      toast({ title: 'Terhapus', description: 'Akses dicabut.' });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus token.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setDeleteTokenId(null);
      setIsSubmitting(false);
    }
  }, [deleteTokenId, fetchData, toast]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    reviews,
    tokens,
    loading,
    isSubmitting,
    // Token form
    isAddingToken,
    setIsAddingToken,
    usageLimit,
    setUsageLimit,
    generateToken,
    copyLink,
    copiedToken,
    // Edit review
    editingReview,
    reviewForm,
    setReviewForm,
    startEditReview,
    closeEditReview,
    handleSaveReview,
    // Delete review
    deleteReviewId,
    setDeleteReviewId,
    handleDeleteReview,
    // Delete token
    deleteTokenId,
    setDeleteTokenId,
    handleDeleteToken,
    // Refresh
    fetchData,
  };
}
