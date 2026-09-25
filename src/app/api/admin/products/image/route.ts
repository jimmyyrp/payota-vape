import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  PRODUCT_BUCKET,
  PRODUCT_MAX_IMAGE_BYTES,
  extractStoragePath,
  uploadProductImage,
  deleteProductImage,
} from "@/lib/payota-storage";

export const dynamic = "force-dynamic";

const DATA_URL_PATTERN = /^data:image\/(webp|jpeg|jpg|png);base64,([A-Za-z0-9+/=]+)$/;

interface UploadRequest {
  dataUrl?: string;
  slug?: string;
  prev?: string | null;
}

/**
 * Upload foto produk (hasil crop canvas) ke Supabase Storage sebagai WebP.
 * Body: { dataUrl, slug?, prev? } — prev = URL publik lama yang akan dihapus.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: UploadRequest;
  try {
    body = (await request.json()) as UploadRequest;
  } catch {
    return NextResponse.json({ ok: false, message: "Body JSON tidak valid." }, { status: 400 });
  }

  const { dataUrl, slug, prev } = body;
  const match = DATA_URL_PATTERN.exec(dataUrl ?? "");
  if (!match) {
    return NextResponse.json(
      { ok: false, message: "Data foto tidak valid. Mohon crop ulang dari gambar asli." },
      { status: 400 },
    );
  }

  const [, mime, base64] = match;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return NextResponse.json({ ok: false, message: "Data foto rusak." }, { status: 400 });
  }
  if (buffer.length === 0 || buffer.length > PRODUCT_MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { ok: false, message: `Ukuran foto melebihi batas ${Math.floor(PRODUCT_MAX_IMAGE_BYTES / 1024 / 1024)}MB.` },
      { status: 400 },
    );
  }

  const slugPart = (slug ?? "product")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "product";
  const isWebp = mime === "webp";
  const extension = isWebp ? "webp" : "jpg";
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `payota-${slugPart}-${stamp}.${extension}`;

  try {
    const publicUrl = await uploadProductImage({
      fileName,
      buffer,
      contentType: isWebp ? "image/webp" : "image/jpeg",
    });

    if (prev && prev.startsWith("http")) {
      const oldPath = extractStoragePath(prev);
      if (oldPath) await deleteProductImage(oldPath);
    }

    return NextResponse.json({ ok: true, url: publicUrl, bucket: PRODUCT_BUCKET });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}

interface DeleteRequest {
  url?: string;
}

/** Hapus foto produk dari bucket (dipakai saat foto dihapus dari form). */
export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: DeleteRequest;
  try {
    body = (await request.json()) as DeleteRequest;
  } catch {
    return NextResponse.json({ ok: false, message: "Body JSON tidak valid." }, { status: 400 });
  }

  const path = extractStoragePath(body.url ?? "");
  if (!path) {
    return NextResponse.json(
      { ok: false, message: "URL foto tidak dikenal." },
      { status: 400 },
    );
  }

  await deleteProductImage(path);
  return NextResponse.json({ ok: true });
}