import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const ADMIN_COOKIE = "payota_admin";
// Masa aktif sesi admin: 30 hari, agar login tetap tersimpan walau sistem di-update/deploy ulang.
export const ADMIN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export interface AdminSession {
  userId: number;
  role: string;
}

function getAdminUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL belum diisi di .env");
  return url;
}

/**
 * Verifikasi token sesi via RPC verify_admin_session (mirip v1: payload → hash → lookup).
 * Mengembalikan data sesi bila valid.
 */
export async function verifyAdminToken(token: string | null | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const client = getAdminClient();
  const { data, error } = await client.rpc("verify_admin_session", { p_token: token });
  if (error || !data || data.length === 0) return null;
  return { userId: data[0].user_id, role: data[0].role };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Login admin: login_user RPC → simpan token sesi di cookie httpOnly. */
export async function loginAdmin(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
  const client = getAdminClient();
  const { data, error } = await client.rpc("login_user", {
    p_username: username,
    p_password: password,
  });
  if (error) return { ok: false, message: error.message };
  if (!data || data.length === 0) return { ok: false, message: "Username atau password salah." };

  const store = await cookies();
  store.set(ADMIN_COOKIE, data[0].session_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;

  const client = getAdminClient();
  if (token) {
    const { error } = await client.rpc("revoke_admin_session", { p_token: token });
    if (error) console.error("revoke_admin_session:", error.message);
  }
  store.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
}

/** Guard seragam untuk route handler admin: kembalikan 401 bila tak ada sesi. */
export async function guard(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Tidak terautentikasi." }, { status: 401 });
  }
  return null;
}