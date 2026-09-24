"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { Product } from "@/data/products";

/**
 * PayotaArt — "product render" berkualitas high-end yang digambar dari data
 * (tanpa file gambar eksternal → tidak ada broken image).
 */
export function PayotaArt({ product }: { product: Product }) {
  const { art, glow, glowSoft, index, name } = product;

  let body: React.ReactNode;

  switch (art) {
    case "slim":
      body = (
        <>
          <rect x="170" y="88" width="60" height="224" rx="17" fill="url(#body)" />
          <rect x="170" y="88" width="60" height="224" rx="17" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <circle cx="200" cy="150" r="10" fill="#0A0A0C" stroke="#3F3F46" strokeWidth="1.5" />
          <rect x="182" y="180" width="36" height="4" rx="2" fill="#3F3F46" />
          <rect x="182" y="192" width="26" height="4" rx="2" fill="#3F3F46" opacity="0.6" />
        </>
      );
      break;
    case "pod":
      body = (
        <>
          <rect x="156" y="70" width="88" height="260" rx="44" fill="url(#body)" />
          <rect x="156" y="70" width="88" height="260" rx="44" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <rect x="168" y="100" width="64" height="150" rx="32" fill="#101013" />
          <rect x="168" y="100" width="64" height="150" rx="32" fill="none" stroke="#26262C" strokeWidth="1" />
          <circle cx="200" cy="238" r="9" fill="#0A0A0C" stroke="#3F3F46" strokeWidth="1.5" />
        </>
      );
      break;
    case "air":
      body = (
        <>
          <circle cx="200" cy="216" r="86" fill="url(#body)" />
          <circle cx="200" cy="216" r="86" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <circle cx="200" cy="216" r="58" fill="#101013" />
          <circle cx="200" cy="216" r="58" fill="none" stroke="#26262C" strokeWidth="1" />
          <circle cx="200" cy="216" r="16" fill="#0A0A0C" stroke="#3F3F46" strokeWidth="1.5" />
        </>
      );
      break;
    case "one":
      body = (
        <>
          <rect x="142" y="142" width="116" height="116" rx="26" transform="rotate(45 200 200)" fill="url(#body)" />
          <rect x="142" y="142" width="116" height="116" rx="26" transform="rotate(45 200 200)" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <circle cx="200" cy="200" r="30" fill="#0A0A0C" stroke="#3F3F46" strokeWidth="1.5" />
        </>
      );
      break;
    case "dock":
      body = (
        <>
          <ellipse cx="200" cy="300" rx="104" ry="14" fill="#0F0F11" stroke="#26262C" strokeWidth="1" />
          <path d="M140 292 L170 96 Q200 78 230 96 L260 292 Z" fill="url(#body)" />
          <path d="M140 292 L170 96 Q200 78 230 96 L260 292 Z" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <circle cx="200" cy="150" r="10" fill="#0A0A0C" stroke="#3F3F46" strokeWidth="1.5" />
        </>
      );
      break;
    case "shield":
      body = (
        <>
          <path d="M200 78 L262 104 V186 C262 238 236 268 200 292 C164 268 138 238 138 186 V104 Z" fill="url(#body)" />
          <path d="M200 78 L262 104 V186 C262 238 236 268 200 292 C164 268 138 238 138 186 V104 Z" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <path d="M200 118 V260" stroke="#26262C" strokeWidth="2" />
        </>
      );
      break;
    case "strap":
      body = (
        <>
          <rect x="96" y="140" width="208" height="120" rx="24" fill="url(#body)" />
          <rect x="96" y="140" width="208" height="120" rx="24" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <rect x="118" y="172" width="92" height="56" rx="14" fill="#101013" stroke="#26262C" strokeWidth="1" />
          <rect x="250" y="176" width="30" height="48" rx="8" fill="#1A1A1F" stroke="#34343C" strokeWidth="1" />
        </>
      );
      break;
    case "carry":
      body = (
        <>
          <path d="M150 168 H250 A30 30 0 0 1 280 198 V240 H120 V198 A30 30 0 0 1 150 168 Z" fill="url(#body)" />
          <path d="M150 168 H250 A30 30 0 0 1 280 198 V240 H120 V198 A30 30 0 0 1 150 168 Z" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <path d="M164 168 V148 A36 36 0 0 1 236 148 V168" fill="none" stroke="#3F3F46" strokeWidth="7" strokeLinecap="round" />
          <rect x="158" y="196" width="48" height="14" rx="7" fill="#0A0A0C" />
        </>
      );
      break;
    case "studio":
      body = (
        <>
          <circle cx="200" cy="196" r="76" fill="url(#body)" />
          <circle cx="200" cy="196" r="76" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <ellipse cx="200" cy="282" rx="56" ry="8" fill="#0F0F11" stroke="#26262C" strokeWidth="1" />
          <path d="M200 120 C236 146 236 246 200 272 C164 246 164 146 200 120 Z" fill="#0A0A0C" opacity="0.55" />
        </>
      );
      break;
    default:
      body = (
        <>
          <rect x="168" y="92" width="64" height="216" rx="16" fill="url(#body)" />
          <rect x="168" y="92" width="64" height="216" rx="16" fill="none" stroke="url(#edge)" strokeWidth="1" />
          <rect x="180" y="122" width="40" height="130" rx="8" fill="#0E0E11" />
          <circle cx="200" cy="264" r="8" fill="#0A0A0C" stroke="#3F3F46" strokeWidth="1.5" />
        </>
      );
  }

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={`${name} visual`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="pb" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.16" />
          <stop offset="55%" stopColor={glow} stopOpacity="0.03" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#232328" />
          <stop offset="55%" stopColor="#15151A" />
          <stop offset="100%" stopColor="#0C0C0F" />
        </linearGradient>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4C4C55" />
          <stop offset="50%" stopColor={glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3A3A42" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="398" height="398" rx="36" fill="#0A0A0C" stroke="hsl(0 0% 100% / 0.07)" />
      <path d="M0 72 H400 M0 144 H400 M0 216 H400 M0 288 H400 M0 360 H400" stroke="hsl(0 0% 100% / 0.028)" strokeWidth="1" />
      <path d="M72 0 V400 M144 0 V400 M216 0 V400 M288 0 V400 M360 0 V400" stroke="hsl(0 0% 100% / 0.028)" strokeWidth="1" />
      <circle cx="200" cy="200" r="150" fill="url(#pb)" />

      {body}

      <g opacity="0.7">
        <text x="28" y="44" fontSize="11" fontWeight="700" letterSpacing="3" fill={glow}>
          PAYOTA
        </text>
        <text x="28" y="366" fontSize="10" letterSpacing="2" fill="#6B6B74">
          {String(index).padStart(2, "0")} / {art.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}

/**
 * Gambar produk yang selalu aman: kalau produk punya `image`, muat sebagai
 * <img>; gagal → placeholder elegan "IMAGE UNAVAILABLE". Tanpa gambar (dummy)
 * → render <PayotaArt />.
 */
export function ProductImage({
  product,
  image,
  className,
}: {
  product: Product;
  image?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = image ?? product.image;

  if (!imageSrc) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        {failed ? (
          <PayotaArt product={product} />
        ) : (
          <Image
            src="/default-product.webp"
            alt={`${product.name} visual`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 92vw"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    );
  }

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-[#0D0D0D] ${className ?? ""}`}>
        <ImageOff className="h-6 w-6 text-muted-foreground" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Gambar tidak tersedia
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={`${product.name} visual`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className ?? ""}`}
    />
  );
}