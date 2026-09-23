import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site-url';

/**
 * Sitemap dinamis: halaman statis publik + seluruh karya aktif.
 * Kanonik tunggal: /karya/{id} (rute /layanan/{id} memakai canonical ke
 * /karya/{id}, jadi sengaja TIDAK didaftarkan ganda di sini).
 * ISR: di-regenerate tiap 1 jam agar karya baru cepat terindeks.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/karya`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/layanan`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/bantuan`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    // PostgREST memotong tiap request ke maks 1000 baris (db-max-rows),
    // jadi ambil SEMUA karya via loop .range() agar sitemap tidak kehilangan URL.
    const rows: { id: number; updated_at?: string | null }[] = [];
    const PAGE = 1000;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id, updated_at')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .range(offset, offset + PAGE - 1);
      if (error) throw error;
      const batch = (data || []) as { id: number; updated_at?: string | null }[];
      rows.push(...batch);
      if (batch.length < PAGE) break;
      offset += PAGE;
    }

    if (rows.length > 0) {
      const dynamicEntries: MetadataRoute.Sitemap = rows.map((p) => ({
        url: `${SITE_URL}/karya/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
      return [...staticEntries, ...dynamicEntries];
    }
  } catch {
    // Jika DB gagal diakses, tetap keluarkan sitemap statis.
  }

  return staticEntries;
}
