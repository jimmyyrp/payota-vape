/**
 * Sumber tunggal URL produksi untuk semua keperluan SEO/kanonik.
 * Override via NEXT_PUBLIC_SITE_URL di environment.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vapestore.app').replace(/\/$/, '');

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}/${path.replace(/^\//, '')}`;
}
