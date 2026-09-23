'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archive, Check, Eye, Loader2, Trash2, X } from 'lucide-react';
import { formatCompactNumber } from '@/lib/formatters';
import type { Post } from '@/lib/types';
import { KaryaManageChip } from '@/components/karya-manage-chip';
import { useStaffAuth } from '@/hooks/use-staff-auth';
import { useToast } from '@/hooks/use-toast';
import { setPostActiveState } from '@/lib/post-actions';
import { softDeletePost } from '@/lib/queries';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecentWorksProps {
  works: Post[];
  onRefresh?: () => void;
   onDelete?: (postId: number | string) => void;
   onEdit?: (post: Post) => void;
}

export const RecentWorks = ({ works, onRefresh, onDelete, onEdit }: RecentWorksProps) => {
   const { canManage } = useStaffAuth();
   const { toast } = useToast();
   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [bulkAction, setBulkAction] = useState<'archive' | 'delete' | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);

   useEffect(() => {
      const visibleIds = new Set(works.map((work) => String(work.id)));
      setSelectedIds((current) => current.filter((id) => visibleIds.has(id)));
   }, [works]);

   const allSelected = works.length > 0 && works.every((work) => selectedIds.includes(String(work.id)));

   const toggleSelection = (postId: number | string) => {
      const id = String(postId);
      setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
   };

   const toggleAll = () => {
      setSelectedIds(allSelected ? [] : works.map((work) => String(work.id)));
   };

   const handleBulkAction = async () => {
      if (!bulkAction || selectedIds.length === 0) return;
      const action = bulkAction;
      setIsProcessing(true);
      try {
         const toProcess = [...selectedIds];
         const results = await Promise.allSettled(
            toProcess.map(async (id) => {
               if (action === 'delete') {
                  await softDeletePost(Number(id));
                  return;
               }
               const result = await setPostActiveState(id, false);
               if (!result.ok) throw new Error(result.error);
            })
         );
         const failed = results.filter((result) => result.status === 'rejected').length;
         const completed = results.length - failed;
         onRefresh?.();
         toast({
            title: action === 'delete' ? 'Penghapusan Selesai' : 'Pengarsipan Selesai',
            description: failed === 0
               ? `${completed} produk berhasil diproses.`
               : `${completed} berhasil, ${failed} gagal diproses. Coba ulangi item yang gagal.`,
            variant: failed === 0 ? 'default' : 'destructive',
         });
      } finally {
         setSelectedIds([]);
         setBulkAction(null);
         setIsProcessing(false);
      }
   };

  return (
<section className="py-16 md:py-20 px-6 bg-card">
       <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-end sm:justify-between">
                   <div className="text-left space-y-1">
                      <span className="text-primary font-black text-[9px] uppercase tracking-[0.8em]">PRODUK TERBARU</span>
                      <h2 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tighter">Produk Pilihan</h2>
                   </div>
                  {canManage && works.length > 0 && (
                     <div className="flex flex-wrap items-center gap-2">
                        <button
                           type="button"
                           onClick={toggleAll}
                           className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-secondary"
                        >
                           <span className="flex h-4 w-4 items-center justify-center rounded border border-primary/30">
                              {allSelected && <Check size={12} />}
                           </span>
                           {allSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                        </button>
                        {selectedIds.length > 0 && (
                           <>
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary/50">{selectedIds.length} dipilih</span>
                              <button type="button" onClick={() => setBulkAction('archive')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-warning/100 px-3 text-[9px] font-black uppercase tracking-widest text-white hover:opacity-90">
                                 <Archive size={13} /> Arsipkan
                              </button>
                              <button type="button" onClick={() => setBulkAction('delete')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-destructive/100 px-3 text-[9px] font-black uppercase tracking-widest text-white hover:opacity-90">
                                 <Trash2 size={13} /> Hapus
                              </button>
                           </>
                        )}
                     </div>
                  )}
          </div>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10">
              {works.map((work) => (
                <div key={work.id} className="group flex flex-col gap-3 relative">
                    <div className="relative aspect-[3/4] rounded-[1.8rem] overflow-hidden border border-border bg-card shadow-sm transition-all duration-1000 hover:shadow-2xl hover:-translate-y-1">
                      <Link href={`/karya?id=${work.id}`} className="absolute inset-0 z-10" aria-label={`Lihat ${work.title}`}>
                        <img src={work.images?.[0]?.url_images || "/favicon_io/apple-touch-icon.png"} alt={work.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[7px] text-white font-black uppercase tracking-[0.2em] truncate max-w-[85%] border border-white/10 shadow-lg">
                           {(work.categories || []).slice(0, 1).map((c) => c.name).join(' • ')}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-xl px-2 py-0.5 rounded-lg text-[7.5px] text-white font-black uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                           <Eye size={10} /> {formatCompactNumber(work.views)}
                        </div>
                      </Link>
                      {canManage && (
                        <button
                          type="button"
                          aria-label={`${selectedIds.includes(String(work.id)) ? 'Batalkan pilihan' : 'Pilih'} ${work.title}`}
                          onClick={() => toggleSelection(work.id)}
                          className={`absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl transition-all ${
                            selectedIds.includes(String(work.id))
                              ? 'border-primary bg-primary text-white'
                              : 'border-white/40 bg-black/35 text-white hover:bg-primary/80'
                          }`}
                        >
                          {selectedIds.includes(String(work.id)) && <span className="h-3 w-3 rounded-full bg-white" />}
                        </button>
                      )}
                      <div className="absolute top-3 left-3 z-30">
                        <KaryaManageChip
                          postId={work.id}
                          postTitle={work.title}
                          postIsActive={(work.is_active as boolean | undefined) ?? true}
                          onEdit={() => onEdit?.(work)}
                          onActionComplete={onRefresh}
                          onDeleteComplete={onDelete}
                        />
                      </div>
                   </div>
                   <Link href={`/karya?id=${work.id}`} className="px-1">
                      <h3 className="text-[10px] md:text-[11px] font-black text-foreground uppercase tracking-widest line-clamp-2 leading-tight group-hover:text-primary transition-colors">{work.title}</h3>
                   </Link>
                </div>
             ))}
          </div>
       </div>

<AlertDialog open={bulkAction !== null} onOpenChange={(open) => { if (!open) setBulkAction(null); }}>
              <AlertDialogContent className="p-7 sm:p-8 bg-card shadow-4xl text-center">
                <AlertDialogHeader>
                   <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
                      {bulkAction === 'delete' ? 'Hapus Produk Terpilih?' : 'Arsipkan Produk Terpilih?'}
                   </AlertDialogTitle>
                   <AlertDialogDescription className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                      {selectedIds.length} produk akan {bulkAction === 'delete' ? 'dipindahkan ke Sampah.' : 'disembunyikan dari katalog publik.'}
                   </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2">
                   <AlertDialogCancel disabled={isProcessing} className="h-11 flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Batal</AlertDialogCancel>
                   <AlertDialogAction disabled={isProcessing} onClick={(event) => { event.preventDefault(); void handleBulkAction(); }} className="h-11 flex-1 rounded-xl bg-primary text-[9px] font-black uppercase tracking-widest text-white">
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : bulkAction === 'delete' ? <><Trash2 size={13} /> Hapus</> : <><Archive size={13} /> Arsipkan</>}
                   </AlertDialogAction>
                </div>
             </AlertDialogContent>
          </AlertDialog>
    </section>
 );
};
