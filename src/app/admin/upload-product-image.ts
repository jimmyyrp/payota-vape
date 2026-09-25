export interface UploadImageResult {
  ok: boolean;
  url?: string;
  message?: string;
}

interface ApiEnvelope {
  ok?: boolean;
  url?: string;
  message?: string;
}

/** Baca body JSON dengan aman — null bila respons bukan JSON valid. */
async function safeJson(res: Response): Promise<ApiEnvelope | null> {
  try {
    return (await res.json()) as ApiEnvelope;
  } catch {
    return null;
  }
}

/**
 * Unggah foto produk (data URL WebP hasil crop) ke Supabase Storage via
 * endpoint admin. `prev` = URL publik foto lama yang akan dihapus.
 */
export async function uploadProductImage(args: {
  dataUrl: string;
  slug?: string;
  prev?: string | null;
}): Promise<UploadImageResult> {
  try {
    const res = await fetch("/api/admin/products/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await safeJson(res);
    if (!res.ok || !data?.ok) {
      return { ok: false, message: data?.message ?? "Gagal mengunggah foto." };
    }
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, message: "Gagal menghubungi server untuk mengunggah foto." };
  }
}

/** Hapus foto produk di bucket (URL publik). */
export async function deleteProductImage(url: string): Promise<UploadImageResult> {
  try {
    const res = await fetch("/api/admin/products/image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await safeJson(res);
    if (!res.ok || !data?.ok) {
      return { ok: false, message: data?.message ?? "Gagal menghapus foto." };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Gagal menghubungi server untuk menghapus foto." };
  }
}