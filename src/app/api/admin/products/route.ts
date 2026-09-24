import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listAllProducts, createProduct, type ProductInput } from "@/lib/payota-admin";

async function guard() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    const products = await listAllProducts();
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}

function normalize(input: ProductInput): ProductInput {
  return {
    slug: String(input.slug ?? "").trim(),
    index: Number(input.index) || 0,
    category: String(input.category ?? "").trim() || "Perangkat",
    name: String(input.name ?? "").trim(),
    tagline: String(input.tagline ?? "").trim(),
    description: String(input.description ?? "").trim(),
    specs: Array.isArray(input.specs)
      ? input.specs
          .filter((s) => s && (s.label?.trim() || s.value?.trim()))
          .map((s) => ({ label: String(s.label ?? "").trim(), value: String(s.value ?? "").trim() }))
      : [],
    art: String(input.art ?? "device").trim() || "device",
    glow: String(input.glow ?? "#E4E4E7").trim() || "#E4E4E7",
    glowSoft: String(input.glowSoft ?? "").trim(),
    badge: String(input.badge ?? "").trim(),
    featured: !!input.featured,
    price: String(input.price ?? "").trim(),
    isActive: input.isActive !== false,
    image: String(input.image ?? "").trim(),
  };
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  try {
    const raw = (await request.json()) as ProductInput;
    if (!raw.name?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Nama produk wajib diisi." },
        { status: 400 },
      );
    }
    const product = await createProduct(normalize(raw));
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}