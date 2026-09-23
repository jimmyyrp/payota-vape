'use client';

import imageCompression from 'browser-image-compression';
import { getStoragePathFromUrl } from './storage-utils';

// Re-export agar konsumen client tetap bisa impor dari sini
export { getStoragePathFromUrl };

/**
 * Vape Store - Image Upload Utility v1.0 (Supabase Storage)
 * Alur: kompresi lokal -> upload LANGSUNG ke server API (form-data) ->
 * disimpan di bucket `vape_media` lewat service-role di sisi server.
 */

export interface StorageUploadResult {
  url: string;
  path: string;
}

/** Kompres gambar lalu unggah ke Supabase Storage lewat server API. */
export async function compressAndUpload(file: File, fileName?: string): Promise<StorageUploadResult | null> {
  try {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/webp',
    };
    const compressedFile = await imageCompression(file, options);

    const form = new FormData();
    form.append('file', compressedFile, fileName || compressedFile.name || 'image.webp');

    const res = await fetch('/api/storage/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Upload gambar gagal');
    }

    return {
      url: data.url,
      path: data.path,
    };
  } catch (error) {
    console.error('Vape Store Storage Error:', error);
    return null;
  }
}

/** Hapus object Supabase Storage via API route (server-side). */
export async function destroyStorageAsset(path: string): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    return res.ok;
  } catch (error) {
    console.error('Vape Store Storage Delete Error:', error);
    return false;
  }
}

// Re-export alias agar kode lama yang memakai istilah Cloudinary tetap berfungsi
// (logika kini sepenuhnya memakai Supabase Storage).
export { destroyStorageAsset as destroyCloudinaryAsset };
export { getStoragePathFromUrl as getPublicIdFromUrl };