import React from 'react';
import { siteConfig } from '@/data/site-data';
import { SITE_URL, absoluteUrl } from '@/lib/site-url';

/**
 * Komponen JSON-LD (schema.org) untuk Rich Results Google.
 * Server-safe: builder berupa fungsi murni tanpa hook.
 */

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/** Profil bisnis lokal - kunci tampil di Google Maps & panel bisnis. */
export function localBusinessJsonLd() {
  const social = [siteConfig.instagram, siteConfig.tiktok, siteConfig.linktree].filter(Boolean) as string[];
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': absoluteUrl('/#business'),
    name: 'Vape Store',
    alternateName: 'Vape Store',
    description:
      'Toko vape yang menjual pod & mod device, liquid / e-liquid, serta disposable dengan harga terbaik dan kualitas terjaga.',
    url: SITE_URL,
    telephone: siteConfig.phone ? `+62${siteConfig.phone.replace(/^0/, '')}` : undefined,
    image: absoluteUrl('/hero.webp'),
    logo: absoluteUrl('/favicon_io/apple-touch-icon.png'),
    priceRange: '$$',
    foundingDate: siteConfig.est,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Perintis Kemerdekaan No.150, Jati',
      addressLocality: 'Padang Timur',
      addressRegion: 'Sumatera Barat',
      postalCode: '25128',
      addressCountry: 'ID',
    },
    sameAs: social.length > 0 ? social : undefined,
  };
}

/** FAQ rich result dari data faqs situs. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

interface ProductPostLike {
  id: number | string;
  title: string;
  price?: number;
  description?: string;
  image?: string;
}

/** Produk + penawaran pada halaman detail karya. */
export function productJsonLd(post: ProductPostLike, path: `/karya/${string}` | `/layanan/${string}` | `/portofolio/${string}`) {
  const url = absoluteUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: post.title,
    description:
      post.description ||
      `${post.title} - product vape berkualitas dari Vape Store, toko perangkat vaping (pod, mod, liquid, disposable) di Indonesia.`,
    image: post.image ? [post.image] : [absoluteUrl('/hero.webp')],
    category: 'Perangkat & Liquid Vape',
    brand: { '@type': 'Brand', name: 'Vape Store' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IDR',
      price: String(post.price ?? 0),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Vape Store' },
    },
  };
}

/** Breadcrumb rich result. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
