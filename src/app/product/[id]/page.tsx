import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/payota-db";
import { ProductImage } from "@/components/payota/ProductImage";
import { AddToCartPanel } from "@/components/payota/AddToCartPanel";
import { SITE_URL, SITE_NAME, SITE_KEYWORDS } from "@/lib/site";
import { parsePrice } from "@/lib/cart";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/product/${product.id}`;
  const description = `${product.name} — ${product.tagline}. ${product.description}`;

  return {
    title: product.name,
    description: `${product.name} — ${product.tagline}. ${product.description}`,
    keywords: [product.name, product.category, ...SITE_KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url,
      siteName: SITE_NAME,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: `${SITE_URL}/default-product.webp`,
          width: 1254,
          height: 1254,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: [`${SITE_URL}/default-product.webp`],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const url = `${SITE_URL}/product/${product.id}`;
  const priceNumber = parsePrice(product.price);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    image: `${SITE_URL}/default-product.webp`,
    description: product.description,
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      price: priceNumber,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Katalog", item: `${SITE_URL}/catalog` },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };

  return (
    <div className="container-px pt-32 lg:pt-40">
      <Link
        href="/catalog"
        className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
        Kembali ke koleksi
      </Link>

      <div className="mt-10 grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <div
            className="absolute inset-0 -z-10 rounded-full blur-[130px]"
            style={{ background: "radial-gradient(circle, rgba(228,228,231,0.16), transparent 70%)" }}
            aria-hidden
          />
          <div className="overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0A0A0C]">
            <div className="aspect-square">
              <ProductImage product={product} className="h-full w-full" />
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">
            {product.category}
          </p>
          <h1 className="mt-3 font-headline text-4xl font-extrabold tracking-tight lg:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.price}</p>

          <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-10 max-w-lg">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Spesifikasi
            </p>
            <dl className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between py-4">
                  <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                  <dd className="text-sm font-semibold text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <AddToCartPanel product={product} />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/catalog" className="btn-primary group">
              Jelajahi Lainnya
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            {product.badge && (
              <span className="chip border border-white/10 bg-white/[0.03] text-muted-foreground">
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
  );
}