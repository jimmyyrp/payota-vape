'use client';

import { useEffect, useRef } from 'react';
import { APP_BUILD_VERSION } from '@/lib/build-id.generated';
import { APP_BROWSER_VERSION_KEY, clearDataCaches } from '@/lib/browser-cache';

/**
 * VersionGuard - Otomatis membersihkan cache browser setiap kali VERSI KODE
 * WEBSITE berubah (sehabis deploy/update).
 *
 * Cara kerja:
 *  1. Identitas versi dibawa dari server melewati `APP_BUILD_VERSION` yang
 *     dibundel ke dalam JS/HTML baru saat build.
 *  2. Di browser, versi tersebut disimpan di localStorage (kunci
 *     `fee_app_version`).
 *  3. Saat bundle baru ter-serve, JS/HTML baru turun → kode baru berjalan →
 *     nilai `APP_BUILD_VERSION` beda dari yang tersimpan → semua cache
 *     (localStorage non-pengguna, sessionStorage, CacheStorage) dibersihkan
 *     dan halaman dimuat ulang sekali.
 *  4. Sesi login admin & bookmark favorit pengunjung DIJAMIN aman.
 *
 * Termasuk dipicu pada "storage" lintas-tab agar beberapa tab ikut sinkron.
 */
export default function VersionGuard() {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (typeof window === 'undefined') return;

    const setLocalVersion = () => {
      try {
        window.localStorage.setItem(APP_BROWSER_VERSION_KEY, APP_BUILD_VERSION);
      } catch {
        /* abaikan bila localStorage tidak tersedia */
      }
    };

    const purgeOnChange = () => {
      try {
        const stored = window.localStorage.getItem(APP_BROWSER_VERSION_KEY);
        if (stored === APP_BUILD_VERSION) return;

        setLocalVersion();
        // Catat dulu SEBELUM versi tercatat sama, agar reload berikutnya
        // (halaman baru) tetap punya konteks perubahan versi.
        void clearDataCaches().then(() => {
          window.location.reload();
        });
      } catch {
        /* abaikan bila localStorage tidak tersedia */
      }
    };

    purgeOnChange();

    const onStorage = (e: StorageEvent) => {
      if (e.key === APP_BROWSER_VERSION_KEY) {
        try {
          const stored = window.localStorage.getItem(APP_BROWSER_VERSION_KEY);
          if (stored !== APP_BUILD_VERSION) purgeOnChange();
        } catch {
          /* abaikan */
        }
      }
    };
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return null;
}