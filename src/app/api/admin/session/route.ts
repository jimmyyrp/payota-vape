import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Status sesi admin untuk navbar publik (tanpa wajib login):
 * dipakai menentukan apakah ikon "user" menuju dashboard atau
 * membuka form login.
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    return NextResponse.json(
      {
        ok: true,
        loggedIn: !!session,
        role: session?.role ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: true, loggedIn: false, role: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}