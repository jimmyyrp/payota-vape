import { siteConfig } from '@/data/site-data';
import { SITE_URL } from './site-url';

interface WhatsAppProductMessageOptions {
  title: string;
  detailUrl: string;
  imageUrl: string;
}

/**
 * Sumber tunggal URL kanonik berasal dari `site-url.ts`.
 * `getSiteUrl` dipertahankan sebagai alias agar semua pemakaian lama
 * (post-detail-dialog, post-detail-ssr) tetap konsisten.
 */
export function getSiteUrl(): string {
  return SITE_URL;
}

export function toAbsoluteUrl(url: string, origin = SITE_URL): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

/**
 * Bangun deep-link wa.me dari nomor bebas format: "082268948846",
 * "+62 822-6894-8846", "6282268948846" → https://wa.me/6282268948846
 */
export function buildWhatsAppLink(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const normalized = digits.replace(/^0+/, '').replace(/^8/, '628');
  if (!normalized) return '';
  const withCountryCode = normalized.startsWith('62') ? normalized : `62${normalized}`;
  return `https://wa.me/${withCountryCode}`;
}

/**
 * Build WhatsApp deep-link URL for product consultation.
 */
export function buildProductWhatsAppUrl({
  title,
  detailUrl,
  imageUrl,
}: WhatsAppProductMessageOptions): string {
  const message = [
    'Halo, saya ingin bertanya tentang produk berikut:',
    '',
    `Produk: ${title}`,
    `Detail: ${detailUrl}`,
    `Gambar: ${imageUrl}`,
    '',
    'Mohon info ketersediaan dan harganya. Terima kasih.',
  ].join('\n');

  return `${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}