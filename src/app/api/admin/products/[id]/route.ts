import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateProduct, deleteProduct, type ProductInput } from "@/lib/payota-admin";

async function guard() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }
  return null;
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
    badge: String(input.badge ?? "").trim(),
    featured: !!input.featured,
    price: String(input.price ?? "").trim(),
    isActive: input.isActive !== false,
    image: String(input.image ?? "").trim(),
  };
}

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function parseId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await ctx.params;
  const numericId = parseId({ id });
  if (!numericId) {
    return NextResponse.json({ ok: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const raw = (await request.json()) as Partial<ProductInput>;
    const current = raw as ProductInput;
    if (!current.name?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Nama produk wajib diisi." },
        { status: 400 },
      );
    }
    const product = await updateProduct(numericId, normalize(current));
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await ctx.params;
  const numericId = parseId({ id });
  if (!numericId) {
    return NextResponse.json({ ok: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    await deleteProduct(numericId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}