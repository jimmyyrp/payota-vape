import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateCategory, deleteCategory, type CategoryInput } from "@/lib/payota-admin";

async function guard() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }
  return null;
}

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function normalize(input: CategoryInput): CategoryInput {
  return {
    slug: String(input.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "kategori",
    name: String(input.name ?? "").trim(),
    tagline: String(input.tagline ?? "").trim(),
    isActive: input.isActive !== false,
  };
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await ctx.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ ok: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const raw = (await request.json()) as CategoryInput;
    const category = await updateCategory(numericId, normalize(raw));
    return NextResponse.json({ ok: true, category });
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
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ ok: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    await deleteCategory(numericId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}