import type { Metadata } from 'next';
import { JsonLd, faqJsonLd } from '@/components/seo/json-ld';
import { faqs } from '@/data/site-data';
import BantuanClient from './bantuan-client';

export const metadata: Metadata = {
  title: 'Pusat Bantuan & FAQ',
  description:
    'Jawaban atas pertanyaan umum Vape Store: konsultasi produk, cara pemesanan melalui WhatsApp, dan ketersediaan stok perangkat & liquid.',
  alternates: { canonical: '/bantuan' },
};

export default function BantuanPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <BantuanClient />
    </>
  );
}