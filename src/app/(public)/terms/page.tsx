import type { Metadata } from 'next';
import TermsClient from './terms-client';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Syarat penggunaan situs Vape Store: ketentuan pemesanan, pembayaran, pengiriman, pembatalan order, serta hak kekayaan intelektual.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <TermsClient />;
}
