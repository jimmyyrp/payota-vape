'use client';

import { useEffect } from 'react';
import { incrementPostViews } from '@/lib/queries';

/**
 * useTrackPostView — catat +1 view sekali per sesi per karya (sessionStorage guard).
 * Sumber tunggal tracking view: dipakai galeri karya, halaman favorit, dan
 * detail SSR agar tidak ada lagi block sessionStorage yang digandakan.
 */
export function useTrackPostView(
  postId: number | string | null | undefined,
  onTracked?: () => void
): void {
  useEffect(() => {
    if (postId == null) return;
    const id = String(postId);
    const viewedKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewedKey)) return;

    let cancelled = false;
    (async () => {
      try {
        await incrementPostViews(Number(id));
        if (cancelled) return;
        sessionStorage.setItem(viewedKey, 'true');
        onTracked?.();
      } catch {
        /* silent — view counter tidak kritis */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId, onTracked]);
}