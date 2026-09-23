'use client';

import { useEffect, useState } from 'react';

/**
 * useDeveloperInfo - Mengambil profil developer (nama + WhatsApp) dari sumber
 * GitHub (api/developer.json) agar tim developer dapat memperbarui kontak
 * tanpa perlu deploy ulang aplikasi.
 *
 * Fitur:
 *  - Fetch JSON mentah dari raw.githubusercontent.com dengan timeout.
 *  - Memvalidasi bentuk { success, data.developer }.
 *  - Normalisasi nomor WhatsApp ke format internasional (0 -> 62, hapus non-digit).
 *  - Cache di localStorage (TTL 30 menit) supaya tidak fetch berulang tiap render.
 *  - Fallback ke kontak default bila fetch gagal / offline / format tidak valid.
 */

interface Developer {
  name: string;
  whatsapp: string;
}

const DEV_RAW_URL = 'https://raw.githubusercontent.com/jimmyyrp/jimmyyrp/main/api/developer.json';
const CACHE_KEY = 'fee_developer_info';
const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;

/** Kontak default bila data GitHub tidak tersedia. */
const DEFAULT_DEVELOPER: Developer = {
  name: 'Jimmy',
  whatsapp: '081276484493',
};

export interface DeveloperInfo {
  developer: Developer;
  whatsappLink: string;
  loading: boolean;
}

import { buildWhatsAppLink as buildWaDeepLink } from '@/lib/whatsapp';

/** Ubah "08123456789" -> "628123456789" / pertahankan "628..." */
export function normalizeWhatsApp(input: string | null | undefined): string {
  const deepLink = buildWaDeepLink(input || '');
  return deepLink ? deepLink.replace('https://wa.me/', '') : '';
}

const buildWhatsAppLink = (raw: string): string => buildWaDeepLink(raw);

interface CachedPayload {
  fetchedAt: number;
  developer: Developer;
}

function readCache(): Developer | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.developer || !parsed.developer.name) return null;
    const fetchedAt = typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : 0;
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    // Jangan pakai cache lama jika tanggal pria; cukup pastikan valid shape.
    return parsed.developer;
  } catch {
    return null;
  }
}

function writeCache(developer: Developer) {
  try {
    const payload: CachedPayload = { fetchedAt: Date.now(), developer };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* abaikan bila localStorage penuh / tidak tersedia */
  }
}

function validate(raw: unknown): Developer | null {
  try {
    const body = raw as {
      success?: boolean;
      data?: { developer?: { name?: unknown; whatsapp?: unknown } };
    };
    if (!body || body.success !== true || !body.data) return null;
    const dev = body.data.developer;
    if (!dev) return null;
    const name = String(dev.name || '').trim();
    const whatsapp = String(dev.whatsapp || '').trim();
    if (!name || !whatsapp) return null;
    return { name, whatsapp };
  } catch {
    return null;
  }
}

export function useDeveloperInfo(): DeveloperInfo {
  const [developer, setDeveloper] = useState<Developer>(DEFAULT_DEVELOPER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const cached = readCache();
    if (cached) {
      setDeveloper(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    (async () => {
      try {
        const res = await fetch(DEV_RAW_URL, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const dev = validate(json);
        if (dev) {
          writeCache(dev);
          if (active) {
            setDeveloper(dev);
            setLoading(false);
          }
          return;
        }
        throw new Error('Format data tidak valid');
      } catch {
        // Fallback ke default tanpa mengubah konten.
        if (active) setLoading(false);
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  const whatsappLink = buildWhatsAppLink(developer.whatsapp);

  return { developer, whatsappLink, loading };
}
