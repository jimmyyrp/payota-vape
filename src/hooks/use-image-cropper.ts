'use client';

/**
 * useImageCropper - Satu-satunya sumber logika CROP & POTONG gambar yang
 * reusable (dipakai modal Karya & form Banner Event, dst).
 *
 * Memisahkan "mempotong gambar jadi File webp" dari "upload ke Cloudinary":
 * hook ini hanya bertanggung jawab memotong. Caller yang memutuskan mau
 * diapakan hasilnya (mis. tambah ke galeri karya / jadi banner event).
 *
 * UI pemotong ada di komponen presentasional ImageCropDialog
 * (src/components/image-crop-dialog.tsx) — pasangkan state dari hook ini.
 */

import { useCallback, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';

// Re-export tipe crop agar konsumen cukup impor dari hooks ini,
// tidak perlu lagi bergantung langsung ke react-easy-crop.
export type { Area, Point } from 'react-easy-crop';

export interface CropState {
  isCropping: boolean;
  currentFileToCrop: string | null;
  crop: Point;
  zoom: number;
  croppedAreaPixels: Area | null;
  aspect: number;
}

export interface RatioOption {
  label: string;
  value: number;
}

/** Rasio default + daftar rasio untuk galeri karya (pola Karya lama). */
export const DEFAULT_CROP_ASPECT = 3 / 4;

export const RATIOS = [
  { label: 'P', value: 3 / 4 },
  { label: 'S', value: 1 / 1 },
  { label: 'L', value: 4 / 3 },
] as const;

/** Rasio untuk banner event: cenderung lebar. */
export const BANNER_RATIOS = [
  { label: 'S', value: 1 / 1 },
  { label: 'L', value: 4 / 3 },
  { label: 'XL', value: 16 / 9 },
] as const;

export function makeResetCropState(aspect: number = DEFAULT_CROP_ASPECT): CropState {
  return {
    isCropping: false,
    currentFileToCrop: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null,
    aspect,
  };
}

export function useImageCropper(initialAspect: number = DEFAULT_CROP_ASPECT) {
  const [cropState, setCropState] = useState<CropState>(() => makeResetCropState(initialAspect));

  /** Buka dialog crop untuk sebuah file (di-feed lewat FileReader). */
  const openCropDialog = useCallback(
    (file: File, aspect?: number) => {
      const reader = new FileReader();
      reader.onload = () => {
        setCropState({
          isCropping: true,
          currentFileToCrop: reader.result as string,
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedAreaPixels: null,
          aspect: aspect ?? initialAspect,
        });
      };
      reader.readAsDataURL(file);
    },
    [initialAspect]
  );

  /** Simpan bingkai pixel yang dipilih user (dipanggil onCropComplete dari Cropper). */
  const handleCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCropState((prev) => ({ ...prev, croppedAreaPixels: croppedPixels }));
  }, []);

  /** Tutup dialog (dan buang gambar sumber di memori). */
  const closeCropDialog = useCallback(() => {
    setCropState((prev) => ({ ...prev, isCropping: false, currentFileToCrop: null }));
  }, []);

  const resetCrop = useCallback(() => {
    setCropState(makeResetCropState(initialAspect));
  }, [initialAspect]);

  /**
   * Potong gambar sesuai bingkai terpilih & kembalikan File webp.
   * - Bila tidak ada gambar/bingkai -> resolve(null) tanpa efek.
   * - Bila gambar rusak / canvas gagal -> onError(message) lalu resolve(null).
   * Caller bertanggung jawab meng-upload File hasil (mis. compressAndUpload).
   */
  const applyCrop = useCallback(
    (onError?: (message: string) => void): Promise<File | null> =>
      new Promise((resolve) => {
        const src = cropState.currentFileToCrop;
        const area = cropState.croppedAreaPixels;
        if (!src || !area) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = area.width;
          canvas.height = area.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            closeCropDialog();
            onError?.('Tidak dapat membuat kanvas gambar.');
            resolve(null);
            return;
          }
          ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
          canvas.toBlob((blob) => {
            closeCropDialog();
            if (!blob) {
              onError?.('Gagal mengonversi gambar yang dipotong.');
              resolve(null);
              return;
            }
            resolve(new File([blob], `f_${Date.now()}.webp`, { type: 'image/webp' }));
          }, 'image/webp');
        };
        img.onerror = () => {
          closeCropDialog();
          onError?.('File gambar tidak valid atau rusak.');
          resolve(null);
        };
        img.src = src;
      }),
    [cropState.currentFileToCrop, cropState.croppedAreaPixels, closeCropDialog]
  );

  return {
    cropState,
    setCropState,
    openCropDialog,
    handleCropComplete,
    closeCropDialog,
    resetCrop,
    applyCrop,
  };
}