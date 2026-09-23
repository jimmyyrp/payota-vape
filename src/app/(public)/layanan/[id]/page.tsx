import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PostDetailSSR } from '@/components/post-detail-ssr';
import type { PostDetailData } from '@/components/post-detail-ssr';
import { JsonLd, productJsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/lib/site-url';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await supabase
    .from('products')
    .select(`*, product_images(url_images)`)
    .eq('id', id)
    .single();

  if (!post) return { title: 'Produk Tidak Ditemukan - Vape Store' };

  const imageUrl = post.product_images?.[0]?.url_images;

  return {
    title: `${post.title} | Vape Store`,
    description: `Eksplorasi produk ${post.title}. Original & berkualitas di Vape Store.`,
    alternates: { canonical: `/layanan/${id}` },
    openGraph: {
      title: `${post.title} - Vape Store`,
      description: `Produk pilihan: ${post.title}. Vape & liquid original dengan harga bersahabat.`,
      url: absoluteUrl(`/layanan/${id}`),
      siteName: 'Vape Store',
      images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: `Produk ${post.title} dari Vape Store.`,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  // Embed sub_categories wajib di-disambiguasi lewat hint FK karena ada dua
  // jalur relasi (FK langsung + junction) yang memicu HTTP 300 PGRST201.
  const { data: postRow } = await supabase
    .from('products')
    .select(`
      *,
      sub_categories!posts_sub_category_id_fkey(name),
      product_images(url_images, urutan)
    `)
    .eq('id', id)
    .maybeSingle();

  if (!postRow) notFound();

  const catRows = await supabase
    .from('product_categories')
    .select('categories(name)')
    .eq('product_id', id);
  const categories = ((catRows.data || []) as unknown as { categories: { name: string } | null }[])
    .map((r) => r.categories)
    .filter((c): c is { name: string } => !!c);

  const post = { ...postRow, categories };

  const firstImage = Array.isArray(post.product_images) && post.product_images.length > 0
    ? post.product_images[0]?.url_images
    : undefined;

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(
            {
              id: post.id,
              title: post.title,
              price: post.price,
              description: post.description,
              image: firstImage,
            },
            `/layanan/${id}`
          ),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Katalog', path: '/layanan' },
            { name: post.title, path: `/layanan/${id}` },
          ]),
        ]}
      />
      <PostDetailSSR
        post={post as PostDetailData}
        backHref="/layanan"
        backLabel="Kembali ke Katalog"
        pageTitlePrefix="Produk"
      />
    </>
  );
}