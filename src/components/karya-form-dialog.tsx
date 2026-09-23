'use client';

/**
 * KaryaFormDialog - SATU-SATUNYA modal Tambah/Ubah karya, dipakai oleh
 * Manajemen Karya admin DAN editor inline di halaman publik (beranda, galeri,
 * detail) agar desainnya konsisten persis.
 * Responsive: bottom-sheet on mobile, centered popup on desktop.
 * Presentational murni: semua state & logika simpan lewat props.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Loader2, GripVertical, ChevronDown, Check, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorBanner, FieldHint, INVALID_RING } from '@/components/ui/form-validation';
import { ImageCropDialog } from '@/components/image-crop-dialog';
import { cn } from '@/lib/utils';
import type { Area } from '@/hooks/use-image-cropper';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PostFormData, CategoryEntry, SubCategoryEntry, CropState, FieldErrors } from '@/app/admin/karya/use-karya-admin';

// ============================================
// SORTABLE GALLERY ITEM
// ============================================

interface SortableGalleryItemProps {
  item: { url: string };
  index: number;
  onRemove: (idx: number) => void;
  canDelete: boolean;
}

function SortableGalleryItem({ item, index, onRemove, canDelete }: SortableGalleryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `gallery-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square rounded-[1.2rem] md:rounded-[1.8rem] overflow-hidden group border border-border/60',
        isDragging && 'ring-2 ring-primary shadow-2xl scale-105'
      )}
    >
      <img src={item.url} alt={`Gallery ${index + 1}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />

      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 md:w-7 md:h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all z-20 cursor-grab active:cursor-grabbing"
        title="Geser untuk mengubah urutan"
      >
        <GripVertical size={14} />
      </button>

      {/* Order Number Badge */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[8px] font-black z-20 shadow-md">
        {index + 1}
      </div>

      {/* Delete Button — pojok kanan bawah di layar sentuh, overlay penuh saat hover di desktop.
          Aturan katalog: karya wajib menyisakan minimal 1 gambar, jadi tombol ini
          disembunyikan bila hanya tersisa 1 foto (tidak bisa dihapus). */}
      {canDelete && (
        <button
          onClick={() => onRemove(index)}
          aria-label={`Hapus gambar ${index + 1}`}
          title="Hapus gambar"
          className="absolute z-10 flex items-center justify-center
                     bottom-2 right-2 h-8 w-8 rounded-lg bg-black/50 backdrop-blur-sm text-white
                     lg:inset-0 lg:bottom-auto lg:right-auto lg:h-full lg:w-full lg:rounded-none lg:bg-black/40 lg:backdrop-blur-none
                     lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} className="lg:size-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// INLINE CATEGORY / SUB-CATEGORY SELECT
// (bukan Radix Popover — kompatibel penuh di dalam Dialog, mobile & desktop)
// ============================================

interface CategorySelectProps {
  label: string;
  placeholder: string;
  hint?: string;
  invalid?: boolean;
  selectedIds: number[];
  options: CategoryEntry[];
  onToggle: (id: number) => void;
  onFirst: (id: number) => void;
  selectedOptionIds?: number[];
  primaryFirst?: boolean;
}

function CategorySelect({
  label,
  placeholder,
  hint,
  invalid,
  selectedIds,
  options,
  onToggle,
  onFirst,
  selectedOptionIds,
  primaryFirst,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const orderIds = (selectedOptionIds || selectedIds);
  const isPrimary = (id: number) => primaryFirst && orderIds.indexOf(id) === 0;

  const selectedOptions = options
    .filter((o) => orderIds.includes(o.id))
    .sort((a, b) => {
      if (!primaryFirst) return 0;
      const ai = orderIds.indexOf(a.id);
      const bi = orderIds.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

  const list = options
    .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const ac = selectedIds.includes(a.id) ? 0 : 1;
      const bc = selectedIds.includes(b.id) ? 0 : 1;
      if (ac !== bc) return ac - bc;
      if (primaryFirst) {
        const ai = orderIds.indexOf(a.id);
        const bi = orderIds.indexOf(b.id);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">{label}</Label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'w-full min-h-[52px] rounded-2xl bg-primary/5 border px-4 py-3 text-left flex items-center justify-between gap-3 transition-all',
          invalid ? INVALID_RING : 'border-border/60',
          selectedIds.length > 0 && 'border-primary/20',
          open && 'border-primary/40'
        )}
      >
        <span className="min-w-0 flex-1">
          {selectedIds.length === 0 ? (
            <span className="text-[11px] font-bold uppercase text-primary/40">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap gap-1.5">
              {selectedOptions.map((o) => (
                <span
                  key={o.id}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider',
                    isPrimary(o.id) ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  )}
                >
                  {o.name}
                  {isPrimary(o.id) && ' · utama'}
                </span>
              ))}
              {selectedIds.length > 3 && (
                <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-[9px] font-black text-primary">
                  +{selectedIds.length - 3}
                </span>
              )}
            </span>
          )}
        </span>
        <ChevronDown size={16} className={cn('shrink-0 text-primary/30 transition-transform', open && 'rotate-180')} />
      </button>

      {hint && <FieldHint message={hint} />}

      {open && (
        <div className="border border-primary/10 rounded-2xl overflow-hidden bg-primary/[0.02]">
          <div className="px-3 py-2 border-b border-border/60 bg-primary/[0.02] flex items-center gap-2">
            <Search size={13} className="text-primary/30 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="flex-1 bg-transparent outline-none text-[11px] font-bold text-primary placeholder:text-primary/30"
            />
          </div>
          <ScrollArea className="max-h-56">
            <div className="p-1.5">
              {list.length === 0 ? (
                <p className="px-3 py-3 text-[9px] text-primary/30 italic font-medium">
                  {search ? 'Tidak ada hasil.' : options.length === 0 ? 'Belum ada opsi.' : 'Semua sudah terpilih.'}
                </p>
              ) : (
                list.map((o) => {
                  const checked = selectedIds.includes(o.id);
                  const primary = isPrimary(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        if (primaryFirst && checked) {
                          onFirst(o.id);
                        } else {
                          onToggle(o.id);
                        }
                        setSearch('');
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/5 transition-colors rounded-lg',
                        checked && 'bg-primary/5'
                      )}
                    >
                      <span className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                        checked ? 'bg-primary border-primary text-white' : 'border-primary/25 bg-card'
                      )}>
                        {checked && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className={cn('flex-1 min-w-0 text-[10px] font-bold uppercase truncate', checked ? 'text-primary' : 'text-primary/70')}>
                        {o.name}
                      </span>
                      {primary && (
                        <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-primary">Utama</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// ============================================
// PORTFOLIO FORM DIALOG PROPS
// ============================================

interface KaryaFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: { id: number; title: string } | null;
  formData: PostFormData;
  setFormData: React.Dispatch<React.SetStateAction<PostFormData>>;
  categories: CategoryEntry[];
  subCategories: SubCategoryEntry[];
  isSubmitting: boolean;
  isUploadingImage: boolean;
  isChanged: boolean;
  fieldErrors: FieldErrors;
  onSave: () => void;
  cropState: CropState;
  setCropState: React.Dispatch<React.SetStateAction<CropState>>;
  onCropComplete: (area: Area, pixels: Area) => void;
  onApplyCrop: () => void;
  onOpenCropDialog: (file: File) => void;
  onRemoveImage: (idx: number) => void;
  onReorderGallery: (oldIndex: number, newIndex: number) => void;
  ratios: readonly { label: string; value: number }[];
}

// ============================================
// MAIN COMPONENT
// ============================================

export const KaryaFormDialog: React.FC<KaryaFormDialogProps> = ({
  isOpen,
  onOpenChange,
  editingItem,
  formData,
  setFormData,
  categories,
  subCategories,
  isSubmitting,
  isUploadingImage,
  isChanged,
  fieldErrors,
  onSave,
  cropState,
  setCropState,
  onCropComplete,
  onApplyCrop,
  onOpenCropDialog,
  onRemoveImage,
  onReorderGallery,
  ratios,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const closeCropDialog = () =>
    setCropState((prev) => ({ ...prev, isCropping: false, currentFileToCrop: null }));

  const errorList = (Object.values(fieldErrors).filter(Boolean) as string[]);
  const hasErrors = errorList.length > 0;
  const canSubmit = editingItem ? isChanged : true;

  // Sub kategori wajib milik kategori yang sedang dipilih (1 karya = 1 + 1).
  const selectedCategoryId = formData.category_ids[0];
  const availableSubs =
    typeof selectedCategoryId === 'number'
      ? subCategories.filter((sc) => sc.category_id === selectedCategoryId)
      : [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = formData.gallery.findIndex((_, i) => `gallery-${i}` === active.id);
    const newIndex = formData.gallery.findIndex((_, i) => `gallery-${i}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderGallery(oldIndex, newIndex);
    }
  };

  return (
    <>
      {/* MAIN FORM DIALOG */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent overlayClassName="!z-[360]" className="!z-[370] w-[calc(100%-1rem)] sm:w-full md:max-w-[760px] rounded-2xl md:rounded-3xl border-none p-0 overflow-hidden bg-card shadow-4xl flex flex-col max-h-[95dvh] md:max-h-[90vh]" onCloseAutoFocus={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="shrink-0 px-6 py-5 md:px-8 md:py-6 bg-primary text-white">
            <DialogTitle className="text-base md:text-lg font-headline uppercase font-bold tracking-widest">
              {editingItem ? 'Edit Produk' : 'Terbitkan Produk Baru'}
            </DialogTitle>
            <DialogDescription className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 font-medium">
              Pengaturan detail karya untuk publikasi galeri Vape Store.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6 space-y-5 no-scrollbar">
            {hasErrors && <ErrorBanner errors={errorList} />}

            {/* TITLE & PRICE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Judul Karya</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={cn(
                    'h-12 rounded-2xl bg-primary/5 border-none px-5 shadow-inner text-sm font-bold text-foreground',
                    fieldErrors.title && INVALID_RING
                  )}
                />
                <FieldHint message={fieldErrors.title} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Harga (IDR)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className={cn(
                    'h-12 rounded-2xl bg-primary/5 border-none px-5 shadow-inner text-sm font-bold text-foreground',
                    fieldErrors.price && INVALID_RING
                  )}
                />
                <FieldHint message={fieldErrors.price} />
              </div>
            </div>

            {/* DESKRIPSI */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">
                Deskripsi <span className="text-primary/20 normal-case">(opsional)</span>
              </Label>
              <Textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                rows={3}
                maxLength={2000}
                placeholder="Ceritakan detail produk: tipe device, rasa & kadar nikotin liquid, kekuatan puff, kelengkapan paket..."
                className="rounded-2xl bg-primary/5 border-none shadow-inner text-sm font-medium text-foreground min-h-[80px] resize-y"
              />
              <p className="text-[8px] font-bold uppercase tracking-widest text-primary/20 text-right">
                {formData.deskripsi.length}/2000
              </p>
            </div>

            {/* GALLERY UPLOAD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Media Visual (Maks. 5, Min. 1)</Label>
                {formData.gallery.length > 1 && (
                  <span className="text-[7px] md:text-[8px] font-bold uppercase text-primary/20 flex items-center gap-1">
                    <GripVertical size={10} /> Geser untuk mengubah urutan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
                {formData.gallery.length < 5 && (
                  <div className="relative aspect-square">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onOpenCropDialog(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-wait"
                    />
                    <div className="h-full w-full rounded-[1.2rem] md:rounded-[1.8rem] border-2 border-dashed flex flex-col items-center justify-center bg-primary/5 border-primary/10 hover:border-primary/30 transition-all">
                      {isUploadingImage ? (
                        <>
                          <Loader2 size={20} className="text-primary/40 animate-spin" />
                          <span className="text-[7px] md:text-[8px] font-black uppercase text-primary/20">UNGGAH...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} className="text-primary/20" />
                          <span className="text-[7px] md:text-[8px] font-black uppercase text-primary/20">UNGGAH</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formData.gallery.map((_, i) => `gallery-${i}`)} strategy={rectSortingStrategy}>
                    {formData.gallery.map((item, idx) => (
                      <SortableGalleryItem
                        key={`gallery-${idx}`}
                        item={item}
                        index={idx}
                        onRemove={onRemoveImage}
                        canDelete={formData.gallery.length > 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
              <FieldHint message={fieldErrors.gallery} />
            </div>

            {/* KATEGORI & SUB KATEGORI (dropdown inline — andal di mobile & desktop).
                Aturan katalog: 1 karya = 1 kategori + 1 sub kategori (single-select). */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <CategorySelect
                label="Kategori (pilih 1)"
                placeholder="Pilih 1 kategori..."
                invalid={!!fieldErrors.categories}
                selectedIds={formData.category_ids}
                options={categories}
                onToggle={(id) =>
                  setFormData((prev) => {
                    const selectingSame = prev.category_ids.includes(id);
                    const nextCategoryIds = selectingSame ? [] : [id];
                    return {
                      ...prev,
                      category_ids: nextCategoryIds,
                      // Ganti/lepas kategori → sub kategori lama tidak relevan lagi.
                      sub_category_ids: selectingSame ? [] : prev.sub_category_ids,
                    };
                  })
                }
                onFirst={() => {}}
              />

              <CategorySelect
                label="Sub Kategori (pilih 1)"
                placeholder={formData.category_ids.length !== 1 ? 'Pilih kategori dulu...' : 'Pilih 1 sub kategori...'}
                invalid={!!fieldErrors.subcategories}
                selectedIds={formData.sub_category_ids}
                options={availableSubs}
                onToggle={(id) =>
                  setFormData((prev) => ({
                    ...prev,
                    sub_category_ids: prev.sub_category_ids.includes(id) ? [] : [id],
                  }))
                }
                onFirst={() => {}}
              />
            </div>
            {fieldErrors.subcategories && <FieldHint message={fieldErrors.subcategories} />}

            {/* ACTIVE/DRAFT TOGGLE */}
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="p_is_active"
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData((prev) => ({ ...prev, is_active: !!v }))}
              />
              <label htmlFor="p_is_active" className="text-[10px] font-black uppercase text-primary/30 cursor-pointer">
                Tayangkan Karya di Galeri Publik
              </label>
            </div>
          </div>

          <DialogFooter className="shrink-0 p-5 md:p-8 pt-4 bg-card border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[10px] font-black uppercase text-primary/30 hover:text-primary/30 hover:bg-primary/5 h-12 px-4 flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={onSave}
              disabled={isSubmitting || !canSubmit}
              className={cn(
                'bg-primary hover:opacity-90 text-white rounded-[1.5rem] h-12 px-8 text-[10px] font-black uppercase shadow-2xl border-none transition-all active:scale-95',
                !canSubmit && !isSubmitting && 'opacity-40 cursor-not-allowed grayscale'
              )}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Simpan Arsip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CROP DIALOG — komponen reuse (useImageCropper + ImageCropDialog):
          z-index di atas modal utama (400/410 > 360/370), baik saat dipakai
          di admin maupun di atas dialog detail publik. */}
      <ImageCropDialog
        cropState={cropState}
        setCropState={setCropState}
        onCropComplete={onCropComplete}
        onApply={onApplyCrop}
        onClose={closeCropDialog}
        isUploading={isUploadingImage}
        ratios={ratios}
        title="Atur Bingkai Visual"
        description="Alat pemotong gambar untuk menyesuaikan rasio visual karya Karya Vape Store."
        applyLabel="Terapkan Bingkai"
        uploadingLabel="MEMPROSES..."
      />
    </>
  );
};