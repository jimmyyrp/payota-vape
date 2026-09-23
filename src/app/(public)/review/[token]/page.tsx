import type { Metadata } from 'next';
import ReviewClient from './review-client';

export const metadata: Metadata = {
  title: 'Form Ulasan Pelanggan',
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return <ReviewClient />;
}
