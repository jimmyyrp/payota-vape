import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PostDetailSSR } from '@/components/post-detail-ssr';
import type { PostDetailData } from '@/components/post-detail-ssr';
import { JsonLd, productJsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/lib/site-url';
import { parseImgIndex } from '@/lib/url-utils';

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ img?: string | string[] } | undefined>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const safeIndex = parseImgIndex(resolvedSearchParams?.img);

    const { data: post } = await supabase
      .from('products')
      .select(`*, product_images(url_images)`)
      .eq('id', id)
      .maybeSingle();

    if (!post) return { title: 'Produk Tidak Ditemukan - Vape Store' };

    const imageUrl = post.product_images?.[safeIndex]?.url_images ?? post.product_images?.[0]?.url_images;

    return {
      title: `${post.title} | Vape Store`,
      description: `Lihat detail produk ${post.title}. Original & berkualitas dengan harga bersahabat di Vape Store.`,
      alternates: { canonical: `/karya/${id}` },
      openGraph: {
        title: `${post.title} - Vape Store`,
        description: `Detail produk: ${post.title}. Temukan vape & liquid original di Vape Store.`,
        url: absoluteUrl(`/karya/${id}`),
        siteName: 'Vape Store',
        images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: `Produk ${post.title} oleh Vape Store.`,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch (err) {
    console.error('[KaryaDetail] generateMetadata gagal:', err);
    return { title: 'Katalog | Vape Store' };
  }
}

export default async function KaryaDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const safeIndex = parseImgIndex(resolvedSearchParams?.img);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let postRow: any = null;
  try {
    const result = await supabase
      .from('products')
      .select(`
        *,
        product_images(url_images, urutan)
      `)
      .eq('id', id)
      .maybeSingle();
    postRow = result.data;
  } catch (err) {
    console.error('[KaryaDetail] query products gagal:', err);
  }

  let categories: { name: string }[] = [];
  try {
    const catRows = await supabase
      .from('product_categories')
      .select('categories(name)')
      .eq('product_id', id);
    categories = ((catRows.data || []) as unknown as { categories: { name: string } | null }[])
      .map((r) => r.categories)
      .filter((c): c is { name: string } => !!c);
  } catch (err) {
    console.error('[KaryaDetail] query categories gagal:', err);
  }

  if (!postRow) {
    notFound();
  }

  const post = { ...postRow, categories } as PostDetailData;
  const safeImages = Array.isArray(post.product_images) ? post.product_images.filter((img) => !!img?.url_images) : [];
  const firstImage = safeImages.length > 0
    ? safeImages[safeIndex]?.url_images ?? safeImages[0]?.url_images
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
              description: post.deskripsi,
              image: firstImage,
            },
            `/karya/${id}`
          ),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Katalog', path: '/karya' },
            { name: post.title, path: `/karya/${id}` },
          ]),
        ]}
      />
      <PostDetailSSR
        post={post as PostDetailData}
        backHref="/karya"
        backLabel="Kembali ke Katalog"
        pageTitlePrefix="Produk"
      />
    </>
  );
}