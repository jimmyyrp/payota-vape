import type { Metadata } from 'next';
import KaryaClient from './karya-client';

export const metadata: Metadata = {
  title: 'Katalog Produk Vape',
  description:
    'Jelajahi katalog produk Vape Store: pod system, mod device, liquid, dan disposable original dengan harga bersahabat. Stok selalu terupdate.',
  alternates: { canonical: '/karya' },
};

export default function KaryaPage() {
  return <KaryaClient />;
}