'use client';

/**
 * TestimonialsAdmin - Main orchestrator for reviews & token management.
 */

import React from 'react';
import { Star, Copy, Trash2, Plus, AlertTriangle, Check, Loader2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTestimonialsAdmin } from './use-reviews-admin';

export default function TestimonialsAdmin() {
  const {
    reviews,
    tokens,
    loading,
    isSubmitting,
    isAddingToken,
    setIsAddingToken,
    usageLimit,
    setUsageLimit,
    generateToken,
    copyLink,
    copiedToken,
    editingReview,
    reviewForm,
    setReviewForm,
    startEditReview,
    closeEditReview,
    handleSaveReview,
    deleteReviewId,
    setDeleteReviewId,
    handleDeleteReview,
    deleteTokenId,
    setDeleteTokenId,
    handleDeleteToken,
  } = useTestimonialsAdmin();

  return (
    <div className="space-y-6 animate-fade-up text-left pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-headline font-bold text-primary uppercase tracking-tighter">Testimoni Klien</h1>
          <p className="text-[8px] text-primary/30 font-bold uppercase tracking-[0.2em]">Manajemen Feedback & Token Akses</p>
        </div>
        <Button
          onClick={() => setIsAddingToken(true)}
          className="bg-primary hover:opacity-90 text-white rounded-2xl h-12 px-8 text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border-none transition-all active:scale-95 group"
        >
          <Plus size={16} className="mr-3 group-hover:rotate-90 transition-transform" /> BUAT AKSES
        </Button>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Tokens skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-2.5 w-24 rounded bg-primary/[0.04] animate-pulse" />
            <div className="border-none rounded-[2.5rem] bg-card shadow-sm p-8 space-y-4">
              <div className="grid grid-cols-12 gap-2 mb-6">
                <div className="col-span-5"><div className="h-5 w-14 rounded-lg bg-primary/[0.04] animate-pulse" /></div>
                <div className="col-span-5"><div className="h-5 w-12 rounded-lg bg-primary/[0.04] animate-pulse" /></div>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2 pb-4 border-b border-primary/[0.03]">
                  <div className="col-span-5"><div className="h-3 w-20 rounded bg-primary/[0.04] animate-pulse" /></div>
                  <div className="col-span-5 space-y-1.5">
                    <div className="h-3 w-12 rounded bg-primary/[0.04] animate-pulse" />
                    <div className="h-1 w-full rounded bg-primary/[0.04] animate-pulse" />
                  </div>
                  <div className="col-span-2 flex justify-end"><div className="h-8 w-8 rounded-xl bg-primary/[0.04] animate-pulse" /></div>
                </div>
              ))}
            </div>
          </div>
          {/* Reviews skeleton */}
          <div className="lg:col-span-3 space-y-4">
            <div className="h-2.5 w-28 rounded bg-primary/[0.04] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-none shadow-sm rounded-[2rem] bg-card p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="w-2.5 h-2.5 rounded-full bg-primary/[0.04] animate-pulse" />
                      ))}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-primary/[0.04] animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-primary/[0.04] animate-pulse" />
                    <div className="h-3 w-3/4 rounded bg-primary/[0.04] animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-primary/[0.04] animate-pulse" />
                  </div>
                  <div className="pt-4 border-t border-primary/[0.03] flex items-center justify-between">
                    <div className="h-3 w-24 rounded bg-primary/[0.04] animate-pulse" />
                    <div className="h-2.5 w-6 rounded bg-primary/[0.04] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* TOKENS PANEL */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/20 ml-1">Tautan Aktif</h2>
            <Card className="border-none rounded-[2.5rem] bg-card shadow-sm overflow-hidden p-8">
              <div className="grid grid-cols-12 gap-2 mb-6">
                <div className="col-span-5">
                  <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[7px] font-black uppercase tracking-widest">TOKEN</span>
                </div>
                <div className="col-span-5">
                  <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[7px] font-black uppercase tracking-widest">KUOTA</span>
                </div>
              </div>
              <div className="space-y-4">
                {tokens.length === 0 ? (
                  <p className="py-10 text-center text-[7px] text-primary/10 uppercase font-black tracking-[0.5em]">Belum Ada Akses</p>
                ) : (
                  tokens.map((t) => (
                    <div key={t.id} className="grid grid-cols-12 items-center gap-2 group border-b border-primary/[0.03] pb-4 last:border-none">
                      <div className="col-span-5 flex flex-col gap-0.5">
                        <span className="text-[8px] font-black text-primary/30 font-mono tracking-tighter truncate">@{t.token}</span>
                      </div>
                      <div className="col-span-5 flex flex-col gap-1 pr-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-primary uppercase">{t.usage_count} / {t.usage_limit}</span>
                          {t.usage_count < t.usage_limit && (
                            <button onClick={() => copyLink(t.token)} className="text-primary hover:opacity-60 transition-colors">
                              {copiedToken === t.token ? <Check size={10} /> : <Copy size={10} />}
                            </button>
                          )}
                        </div>
                        <Progress value={(t.usage_count / (t.usage_limit || 1)) * 100} className="h-1 bg-primary/5" />
                      </div>
                      <div className="col-span-2 text-right">
                        <button onClick={() => setDeleteTokenId(t.id)} className="w-8 h-8 rounded-xl bg-primary/[0.02] text-primary/10 hover:text-destructive transition-all flex items-center justify-center">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* REVIEWS PANEL */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/20 ml-1">Ulasan Terkini</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-primary/[0.01] rounded-[2.5rem] border border-dashed border-primary/10">
                  <p className="text-[8px] text-primary/20 font-black uppercase tracking-widest">Belum Ada Ulasan Masuk</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <Card key={rev.id} className="border-none shadow-sm rounded-[2rem] bg-card p-6 group relative overflow-hidden transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={10} className="fill-primary text-primary" />
                        ))}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => startEditReview(rev)} className="w-8 h-8 rounded-xl bg-primary/5 text-primary/40 hover:text-primary transition-all flex items-center justify-center shadow-sm">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteReviewId(rev.id)} className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-primary/60 italic leading-relaxed mb-6 line-clamp-3 font-medium">{rev.text}</p>
                    <div className="pt-4 border-t border-primary/[0.03] flex items-center justify-between">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest truncate max-w-[70%]">{rev.name}</p>
                      <span className="text-[7px] text-primary/10 font-mono tracking-tighter">#{rev.id}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOKEN FORM DIALOG */}
      <Dialog open={isAddingToken} onOpenChange={setIsAddingToken}>
        <DialogContent className="md:max-w-[360px] border-none p-0 overflow-hidden bg-card shadow-5xl text-left max-h-[85dvh] md:max-h-[85vh] flex flex-col">
          <DialogHeader className="bg-primary px-6 py-5 md:px-8 md:py-8 text-white shrink-0">
            <DialogTitle className="text-sm font-headline font-bold uppercase tracking-widest">Akses Ulasan</DialogTitle>
            <DialogDescription className="text-[8px] md:text-[7px] uppercase tracking-widest text-white/40">Tautan khusus untuk pemberian ulasan klien Vape Store.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 md:px-8 md:py-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] md:text-[8px] font-black uppercase tracking-widest text-primary/20 ml-1">Maksimal Penggunaan</Label>
              <Input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
                className="h-12 rounded-2xl bg-primary/[0.02] border-none px-5 shadow-inner text-sm font-bold text-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsAddingToken(false)} className="text-[9px] font-black uppercase text-primary/20 hover:text-primary/20 hover:bg-primary/5 h-12 px-4 flex-1">Batal</Button>
              <Button onClick={generateToken} disabled={isSubmitting} className="bg-primary hover:opacity-90 text-white rounded-2xl h-12 px-6 md:px-8 text-[9px] font-black uppercase shadow-2xl border-none transition-all flex-[1.5] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin h-3 w-3" /> : 'AKTIFKAN'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT REVIEW DIALOG */}
      <Dialog open={!!editingReview} onOpenChange={(open) => { if (!open) closeEditReview(); }}>
        <DialogContent className="md:max-w-[400px] border-none p-0 overflow-hidden bg-card shadow-5xl text-left max-h-[90dvh] md:max-h-[85vh] flex flex-col">
          <DialogHeader className="bg-primary px-6 py-5 md:px-8 md:py-8 text-white shrink-0">
            <DialogTitle className="text-sm font-headline font-bold uppercase tracking-widest">Ubah Ulasan</DialogTitle>
            <DialogDescription className="text-[8px] md:text-[7px] uppercase tracking-widest text-white/40">
              Perbaiki nama, peran, isi, atau rating ulasan klien.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 md:px-8 md:py-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[8px] font-black uppercase tracking-widest text-primary/20 ml-1">Nama Klien</Label>
                <Input
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-11 rounded-2xl bg-primary/[0.02] border-none px-4 shadow-inner text-[16px] md:text-xs font-bold"
                  placeholder="Klien Vape Store"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] md:text-[8px] font-black uppercase tracking-widest text-primary/20 ml-1">Isi Ulasan</Label>
              <Textarea
                value={reviewForm.text}
                onChange={(e) => setReviewForm((p) => ({ ...p, text: e.target.value }))}
                rows={4}
                maxLength={600}
                className="rounded-2xl bg-primary/[0.02] border-none shadow-inner text-[16px] md:text-xs font-medium resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] md:text-[8px] font-black uppercase tracking-widest text-primary/20 ml-1">Rating (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star size={24} className={n <= reviewForm.rating ? 'fill-primary text-primary' : 'text-primary/15'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={closeEditReview} disabled={isSubmitting} className="text-[9px] font-black uppercase text-primary/20 hover:text-primary/20 hover:bg-primary/5 h-12 px-4 flex-1">Batal</Button>
              <Button onClick={handleSaveReview} disabled={isSubmitting} className="bg-primary hover:opacity-90 text-white rounded-2xl h-12 px-6 md:px-8 text-[9px] font-black uppercase shadow-2xl border-none transition-all flex-[1.5] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin h-3 w-3" /> : 'SIMPAN'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE REVIEW CONFIRM */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-5xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-primary uppercase font-bold tracking-tight">Hapus Ulasan?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary/20 text-[9px] font-light italic text-center uppercase tracking-widest mb-8">
              Data akan hilang permanen & kuota token kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="rounded-2xl h-12 text-[9px] font-black bg-primary/[0.03] border-none flex-1 text-primary">BATAL</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={(e) => { e.preventDefault(); if (!isSubmitting) handleDeleteReview(); }} className="bg-destructive/100 text-white rounded-2xl h-12 flex-1 text-[9px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'HAPUS'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE TOKEN CONFIRM */}
      <AlertDialog open={!!deleteTokenId} onOpenChange={() => setDeleteTokenId(null)}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-5xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-primary uppercase font-bold tracking-tight">Cabut Akses?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary/20 text-[9px] font-light italic text-center uppercase tracking-widest mb-8">
              Klien tidak akan bisa lagi menggunakan tautan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="rounded-2xl h-12 text-[9px] font-black bg-primary/[0.03] border-none flex-1 text-primary">BATAL</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={(e) => { e.preventDefault(); if (!isSubmitting) handleDeleteToken(); }} className="bg-destructive/100 text-white rounded-2xl h-12 flex-1 text-[9px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'CABUT'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
