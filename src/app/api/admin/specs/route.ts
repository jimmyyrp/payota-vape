import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listVapeSpecs } from "@/lib/payota-specs";

export const dynamic = "force-dynamic";

/** Daftar master spesifikasi vape untuk pencarian di form produk. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }

  try {
    const specs = await listVapeSpecs();
    return NextResponse.json(
      { ok: true, specs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}