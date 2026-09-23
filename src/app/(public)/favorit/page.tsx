import type { Metadata } from 'next';
import FavoritClient from './favorit-client';

export const metadata: Metadata = {
  title: 'Koleksi Favorit Saya',
  description: 'Koleksi karya yang Anda tandai sebagai favorit di Vape Store.',
  robots: { index: false, follow: false },
};

export default function FavoritPage() {
  return <FavoritClient />;
}
