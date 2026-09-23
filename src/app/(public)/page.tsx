import type { Metadata } from 'next';
import Script from 'next/script';
import { JsonLd, localBusinessJsonLd } from '@/components/seo/json-ld';
import HomeClient from './home-client';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <HomeClient />
      <Script
        async
        id="adsbygoogle-init"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1531721070664110"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
