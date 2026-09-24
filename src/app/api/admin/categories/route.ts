import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listAllCategories, createCategory, type CategoryInput } from "@/lib/payota-admin";

async function guard() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }
  return null;
}

function normalize(input: CategoryInput): CategoryInput {
  return {
    slug: String(input.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "kategori",
    name: String(input.name ?? "").trim(),
    tagline: String(input.tagline ?? "").trim(),
    isActive: input.isActive !== false,
  };
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    const categories = await listAllCategories();
    return NextResponse.json({ ok: true, categories });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  try {
    const raw = (await request.json()) as CategoryInput;
    if (!raw.name?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Nama kategori wajib diisi." },
        { status: 400 },
      );
    }
    const category = await createCategory(normalize(raw));
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}