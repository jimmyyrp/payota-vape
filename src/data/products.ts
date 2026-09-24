export const categories = ["Perangkat", "Aksesori", "Esensial", "Terbatas"] as const;

export type ProductCategory = (typeof categories)[number];

export type ArtVariant =
  | "device"
  | "slim"
  | "pod"
  | "air"
  | "orb"
  | "dock"
  | "shield"
  | "strap"
  | "carry"
  | "studio"
  | "one";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  index: number;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  specs: ProductSpec[];
  badge?: "Unggulan" | "Baru" | "Terbatas";
  featured?: boolean;
  art: ArtVariant;
  glow: string;
  glowSoft: string;
  price: string;
  image?: string;
}

const P = "PAYOTA";

export const products: Product[] = [
  {
    id: "core",
    index: 1,
    name: `${P} Core`,
    category: "Perangkat",
    tagline: "Bentuk minimalis dengan desain khas untuk keseharian.",
    description:
      "Core adalah awal dari lini PAYOTA. Siluet yang tenang, material premium, dan finishing yang tetap elegan di lingkungan mana pun. Dirancang hanya untuk hal-hal esensial, tanpa berlebihan.",
    specs: [
      { label: "Material", value: "Paduan kelas titanium" },
      { label: "Finishing", value: "Hitam matte, micro-blasted" },
      { label: "Desain", value: "Ringkas" },
      { label: "Koleksi", value: "Seri Core" },
    ],
    badge: "Unggulan",
    featured: true,
    art: "device",
    glow: "#E4E4E7",
    glowSoft: "rgba(228,228,231,0.14)",
    price: "Rp 1.450.000",
  },
  {
    id: "mini",
    index: 2,
    name: `${P} Mini`,
    category: "Perangkat",
    tagline: "Presisi seukuran saku untuk kebutuhan esensial.",
    description:
      "Kecil, tenang, dan penuh pertimbangan. Mini membawa kedisiplinan desain yang sama seperti perangkat lainnya, dalam ukuran yang pas untuk momen-momen ringkas.",
    specs: [
      { label: "Material", value: "Aluminium aerospace" },
      { label: "Finishing", value: "Lapisan soft-touch" },
      { label: "Desain", value: "Bentuk saku" },
      { label: "Koleksi", value: "Seri Core" },
    ],
    art: "pod",
    glow: "#D4D4D8",
    glowSoft: "rgba(212,212,216,0.12)",
    price: "Rp 980.000",
  },
  {
    id: "edge",
    index: 3,
    name: `${P} Edge`,
    category: "Perangkat",
    tagline: "Siluet ramping dengan sudut yang terukur.",
    description:
      "Edge mengganti lengkungan dengan geometri yang tegas. Bingkai tipis dan detail presisi yang tetap tampak modern dari setiap sudut.",
    specs: [
      { label: "Material", value: "Paduan zirkonium" },
      { label: "Finishing", value: "Grafit brushed" },
      { label: "Desain", value: "Slim angular" },
      { label: "Koleksi", value: "Seri Architect" },
    ],
    badge: "Baru",
    art: "slim",
    glow: "#E4E4E7",
    glowSoft: "rgba(228,228,231,0.12)",
    price: "Rp 1.680.000",
  },
  {
    id: "air",
    index: 4,
    name: `${P} Air`,
    category: "Perangkat",
    tagline: "Konstruksi sangat ringan untuk dibawa sepanjang hari.",
    description:
      "Air menghilang di genggaman. Konstruksi super ringan dengan distribusi bobot yang seimbang untuk hari-hari penuh kenyamanan.",
    specs: [
      { label: "Material", value: "Cangkang magnesium" },
      { label: "Finishing", value: "Putih frosted" },
      { label: "Desain", value: "Ultra-ringan" },
      { label: "Koleksi", value: "Seri Air" },
    ],
    art: "air",
    glow: "#A1A1AA",
    glowSoft: "rgba(161,161,170,0.12)",
    price: "Rp 1.290.000",
  },
  {
    id: "pro",
    index: 5,
    name: `${P} Pro`,
    category: "Perangkat",
    tagline: "Performa tinggi untuk hari-hari yang menuntut.",
    description:
      "Pro dirancang untuk intensitas. Desain padat fitur dengan kehadiran yang percaya diri, dibalut kemewahan tenang yang menjadi ciri khas PAYOTA.",
    specs: [
      { label: "Material", value: "Aluminium forged" },
      { label: "Finishing", value: "Hitam bertekstur karbon" },
      { label: "Desain", value: "Performa" },
      { label: "Koleksi", value: "Seri Pro" },
    ],
    art: "slim",
    glow: "#E4E4E7",
    glowSoft: "rgba(228,228,231,0.16)",
    price: "Rp 2.240.000",
  },
  {
    id: "one",
    index: 6,
    name: `${P} One`,
    category: "Perangkat",
    tagline: "Satu desain. Semua yang Anda butuhkan.",
    description:
      "One menyederhanakan koleksi menjadi satu pernyataan — sistem yang beradaptasi, berkembang, dan tumbuh bersama Anda. Sederhana di permukaan, lengkap di baliknya.",
    specs: [
      { label: "Material", value: "Aluminium daur ulang" },
      { label: "Finishing", value: "Abu-abu batu" },
      { label: "Desain", value: "Sistem modular" },
      { label: "Koleksi", value: "Seri One" },
    ],
    art: "one",
    glow: "#D4D4D8",
    glowSoft: "rgba(212,212,216,0.12)",
    price: "Rp 1.520.000",
  },
  {
    id: "dock",
    index: 7,
    name: `${P} Dock`,
    category: "Aksesori",
    tagline: "Charging dock yang dirancang seperti furnitur.",
    description:
      "Dock mengubah pengisian daya harian menjadi ritual kecil. Bobot yang kokoh, dudukan magnetik, dan permukaan batu matte yang cocok di meja mana pun.",
    specs: [
      { label: "Material", value: "Aluminium pejal + batu" },
      { label: "Finishing", value: "Abu-abu matte" },
      { label: "Desain", value: "Teman meja" },
      { label: "Koleksi", value: "Seri Desk" },
    ],
    art: "dock",
    glow: "#A1A1AA",
    glowSoft: "rgba(161,161,170,0.12)",
    price: "Rp 760.000",
  },
  {
    id: "shield",
    index: 8,
    name: `${P} Shield`,
    category: "Aksesori",
    tagline: "Perlindungan presisi dengan sentuhan lembut.",
    description:
      "Shield menjaga perangkat tanpa menambah ketebalan. Cangkang presisi dengan permukaan soft-touch yang mudah dipasang dan terasa menyatu.",
    specs: [
      { label: "Material", value: "Aramid + silikon" },
      { label: "Finishing", value: "Tenun gelap" },
      { label: "Desain", value: "Slim-fit" },
      { label: "Koleksi", value: "Seri Guard" },
    ],
    art: "shield",
    glow: "#E4E4E7",
    glowSoft: "rgba(228,228,231,0.10)",
    price: "Rp 340.000",
  },
  {
    id: "carry",
    index: 9,
    name: `${P} Carry`,
    category: "Esensial",
    tagline: "Perlengkapan harian yang disempurnakan.",
    description:
      "Satu set perlengkapan esensial yang tertata, tenang, dan siap untuk bepergian. Semua yang Anda butuhkan, disusun dengan cermat.",
    specs: [
      { label: "Material", value: "Kanvas berlapis" },
      { label: "Finishing", value: "Blackout, jahitan tonal" },
      { label: "Desain", value: "Kantong modular" },
      { label: "Koleksi", value: "Seri Travel" },
    ],
    art: "strap",
    glow: "#D4D4D8",
    glowSoft: "rgba(212,212,216,0.10)",
    price: "Rp 520.000",
  },
  {
    id: "studio",
    index: 10,
    name: `${P} Studio`,
    category: "Terbatas",
    tagline: "Konsep eksklusif untuk arsip studio.",
    description:
      "Studio adalah karya konsep terbatas dari lab desain PAYOTA. Sudut yang lebih lembut, permukaan yang lebih halus, dan pelat penomoran di setiap unit. Ketika habis, tidak ada stok tambahan.",
    specs: [
      { label: "Material", value: "Zirkonium dipoles" },
      { label: "Finishing", value: "Mirror + frost" },
      { label: "Desain", value: "Konsep studio" },
      { label: "Koleksi", value: "Edisi Terbatas" },
    ],
    badge: "Terbatas",
    art: "studio",
    glow: "#E4E4E7",
    glowSoft: "rgba(228,228,231,0.18)",
    price: "Sesuai permintaan",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.id === slug);
}

export const featuredProduct = products.find((p) => p.featured) ?? products[0];

export const categoryMeta: Record<ProductCategory, { tagline: string; slug: string }> = {
  Perangkat: { tagline: "Inti dari koleksi.", slug: "devices" },
  Aksesori: { tagline: "Pendamping dengan bahasa yang sama.", slug: "accessories" },
  Esensial: { tagline: "Perlengkapan harian yang terkurasi.", slug: "essentials" },
  Terbatas: { tagline: "Bernomor, langka, terdokumentasi.", slug: "limited" },
};