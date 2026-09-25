import "server-only";
import { getAdminClient } from "./supabase";

/** Bucket Supabase Storage tempat foto produk (format WebP). */
export const PRODUCT_BUCKET = "products";

export const PRODUCT_MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Ekstrak path objek dalam bucket dari URL publik storage. */
export function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

/** Pastikan bucket produk ada sebagai bucket publik (idempoten). */
async function ensureProductBucket(): Promise<void> {
  const client = getAdminClient();
  const { data: buckets } = await client.storage.listBuckets();
  if (buckets?.some((bucket) => bucket.id === PRODUCT_BUCKET)) return;

  const { error } = await client.storage.createBucket(PRODUCT_BUCKET, {
    public: true,
    fileSizeLimit: PRODUCT_MAX_IMAGE_BYTES,
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
  });
  if (error) throw new Error(`Gagal membuat bucket: ${error.message}`);
}

/**
 * Unggah foto produk ke Supabase Storage (server-only, pakai service role).
 * Mengembalikan URL publik untuk disimpan di kolom `image`.
 */
export async function uploadProductImage(args: {
  fileName: string;
  buffer: Uint8Array;
  contentType: string;
}): Promise<string> {
  await ensureProductBucket();
  const client = getAdminClient();
  const { error } = await client.storage.from(PRODUCT_BUCKET).upload(args.fileName, args.buffer, {
    contentType: args.contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Gagal mengunggah foto: ${error.message}`);

  const { data } = client.storage.from(PRODUCT_BUCKET).getPublicUrl(args.fileName);
  return data.publicUrl;
}

/** Hapus objek foto dari bucket (best-effort, tidak menggagalkan alur utama). */
export async function deleteProductImage(path: string): Promise<void> {
  try {
    const client = getAdminClient();
    const { error } = await client.storage.from(PRODUCT_BUCKET).remove([path]);
    if (error) console.error("deleteProductImage:", error.message);
  } catch (error) {
    console.error("deleteProductImage:", (error as Error).message);
  }
}