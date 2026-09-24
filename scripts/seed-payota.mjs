import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Seed dibatalkan: isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

/** Import data dummy dari src/data/products.ts (Node 24 auto strip-types). */
const { products, categoryMeta } = await import('../src/data/products.ts');

const categories = Object.entries(categoryMeta).map(([name, meta]) => ({
  slug: meta.slug,
  name,
  tagline: meta.tagline,
  is_active: true,
}));

const productCategorySlugs = new Map(
  categories.map((c) => [c.name, c.slug]),
);

const rows = products.map((p) => ({
  slug: p.id,
  index: p.index,
  category: p.category,
  name: p.name,
  tagline: p.tagline,
  description: p.description,
  specs: JSON.stringify(p.specs),
  art: p.art,
  glow: p.glow,
  glow_soft: p.glowSoft,
  badge: p.badge ?? null,
  featured: p.featured ?? false,
  price: p.price,
  is_active: true,
}));

console.log(`Seeding ${categories.length} kategori PAYOTA...`);
const { data: catData, error: catError } = await supabase
  .from('payota_categories')
  .upsert(categories, { onConflict: 'slug' });

if (catError) {
  console.error('Gagal seed kategori:', catError.message);
  process.exit(1);
}

console.log(`Seeding ${rows.length} produk PAYOTA...`);
const { data: productData, error: productError } = await supabase
  .from('payota_products')
  .upsert(rows, { onConflict: 'slug' });

if (productError) {
  console.error('Gagal seed produk:', productError.message);
  process.exit(1);
}

const ids = rows.map((r) => r.slug).join(', ');
console.log(`✅ Seed selesai.\nKategori: ${categories.length}\nProduk (${rows.length}): ${ids}`);