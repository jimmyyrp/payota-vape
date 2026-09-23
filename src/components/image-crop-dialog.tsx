'use client';

/**
 * ImageCropDialog - dialog CROP reusable (react-easy-crop) dengan zoom slider
 * & pemilih rasio. Presentasional murni: semua state via cropState/setCropState
 * dari useImageCropper (src/hooks/use-image-cropper.ts).
 *
 * Dipakai bersama oleh modal Karya (galeri) dan form Banner Event, dst.
 * z-index sengaja tinggi (overlay 400 / content 410) agar selalu tampil
 * di atas modal utama manapun yang membukanya.
 */

import React from 'react';
import { Maximize2, Square, Layout } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Cropper, { type Area } from 'react-easy-crop';
import { RATIOS, type CropState, type RatioOption } from '@/hooks/use-image-cropper';

const RATIO_ICONS = [Maximize2, Square, Layout];

interface ImageCropDialogProps {
  cropState: CropState;
  setCropState: React.Dispatch<React.SetStateAction<CropState>>;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  /** Panggil dari tombol Terapkan — biasanya: applyCrop() lalu upload File. */
  onApply: () => void;
  /** Tutup/batal dialog (bersihkan gambar sumber). */
  onClose: () => void;
  isUploading?: boolean;
  ratios?: readonly RatioOption[];
  title?: string;
  description?: string;
  applyLabel?: string;
  uploadingLabel?: string;
}

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  cropState,
  setCropState,
  onCropComplete,
  onApply,
  onClose,
  isUploading,
  ratios = RATIOS,
  title = 'Atur Bingkai Visual',
  description = 'Alat pemotong gambar untuk menyesuaikan rasio visual.',
  applyLabel = 'Terapkan Bingkai',
  uploadingLabel = 'MEMPROSES...',
}) => {
  return (
    <Dialog
      open={cropState.isCropping}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent overlayClassName="!z-[400]" className="!z-[410] w-[calc(100%-1rem)] sm:w-full md:max-w-[680px] rounded-2xl md:rounded-3xl border-none p-0 overflow-hidden bg-card shadow-5xl flex flex-col !gap-0 !h-[min(560px,92dvh)] md:!h-[min(640px,88vh)] !max-h-[92dvh] md:!max-h-[88vh]" onCloseAutoFocus={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="bg-primary px-5 py-4 md:px-7 md:py-5 text-white shrink-0">
          <DialogTitle className="text-[11px] md:text-xs uppercase font-black tracking-widest">{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>
        <div className="relative min-h-0 flex-1 bg-black overflow-hidden">
          {cropState.currentFileToCrop && (
            <Cropper
              image={cropState.currentFileToCrop}
              crop={cropState.crop}
              zoom={cropState.zoom}
              aspect={cropState.aspect}
              onCropChange={(c) => setCropState((prev) => ({ ...prev, crop: c }))}
              onCropComplete={onCropComplete}
              onZoomChange={(z) => setCropState((prev) => ({ ...prev, zoom: z }))}
            />
          )}
        </div>
        <div className="shrink-0 p-4 md:p-5 bg-card border-t border-border/60 space-y-3 relative z-10">
          <div className="flex gap-2 justify-center">
            {ratios.map((r, i) => {
              const Icon = RATIO_ICONS[i % RATIO_ICONS.length];
              return (
                <Button
                  key={r.label}
                  title={r.label}
                  variant={cropState.aspect === r.value ? 'default' : 'outline'}
                  onClick={() => setCropState((prev) => ({ ...prev, aspect: r.value }))}
                  className={cn(
                    'h-10 w-10 p-0 rounded-xl',
                    cropState.aspect === r.value && 'bg-primary text-white'
                  )}
                >
                  <Icon size={16} />
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-2">
            <span className="text-[8px] font-bold uppercase text-primary/30 shrink-0">Perbesar</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={cropState.zoom}
              onChange={(e) => setCropState((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))}
              className="flex-1 h-1.5 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 flex-1 text-[10px] font-black uppercase text-primary/30 hover:text-primary/30 hover:bg-primary/5"
            >
              Batal
            </Button>
            <Button
              onClick={onApply}
              disabled={!cropState.croppedAreaPixels || isUploading}
              className="h-10 flex-[2] bg-primary text-white text-[10px] font-black uppercase border-none hover:opacity-90 rounded-[1.5rem] shadow-lg active:scale-95 transition-all"
            >
              {isUploading ? uploadingLabel : applyLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};