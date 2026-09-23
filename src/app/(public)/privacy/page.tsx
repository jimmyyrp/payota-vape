import type { Metadata } from 'next';
import PrivacyClient from './privacy-client';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Bagaimana Vape Store mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat berbelanja di situs kami.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
