"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LoginForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (success) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Login gagal.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.replace("/admin");
      }, 600);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-[1.5rem] border border-white/10 bg-[#0D0D0D] p-8 md:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Lock className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight">
        Admin PAYOTA
      </h1>
      <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        Sistem Manajemen Konten
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Username
          </span>
          <input
            type="text"
            autoComplete="username"
            autoFocus={autoFocus}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-base text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-base text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            Login berhasil! Mengalihkan ke dashboard...
          </p>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="btn-primary h-11 w-full disabled:opacity-50"
        >
          {success ? "Berhasil ✓" : loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Sesi tersimpan aman hingga 30 hari
      </p>
    </div>
  );
}