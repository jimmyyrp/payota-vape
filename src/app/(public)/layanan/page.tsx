import type { Metadata } from 'next';
import LayananClient from './layanan-client';

export const metadata: Metadata = {
  title: 'Katalog Produk & Kategori',
  description:
    'Katalog lengkap Vape Store: pod system, mod device, liquid salt nic & freebase, dan disposable original. Konsultasi mudah via WhatsApp.',
  alternates: { canonical: '/layanan' },
};

export default function LayananPage() {
  return <LayananClient />;
}