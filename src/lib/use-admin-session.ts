"use client";

import { useEffect, useState } from "react";

export interface AdminSessionInfo {
  loading: boolean;
  loggedIn: boolean;
  role: string | null;
}

const INITIAL: AdminSessionInfo = { loading: true, loggedIn: false, role: null };

/**
 * Status sesi admin untuk komponen klien (mis. Navbar publik).
 * Fetch ringan ke /api/admin/session — hanya boolean + role, tanpa
 * data sensitif, sehingga ikon "user" bisa menuju dashboard.
 */
export function useAdminSession(): AdminSessionInfo {
  const [state, setState] = useState<AdminSessionInfo>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setState({ loading: false, loggedIn: !!data?.loggedIn, role: data?.role ?? null });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, loggedIn: false, role: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}