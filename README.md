# PAYOTA — Gaya Hidup Premium

Website katalog produk lifestyle premium — dark, minimal, modern, futuristik. Katalog statis
didukung database Supabase + CMS admin (login admin, kelola produk & kategori). Seluruh konten
antarmuka dalam Bahasa Indonesia.

## Teknologi

- Next.js 15 (App Router) + TypeScript, Tailwind CSS (dark only)
- Supabase (PostgreSQL + RLS + RPC auth) untuk data & sesi admin
- Lucide React (icon), Radix UI Dialog (modal produk)
- Data dummy seed dari `src/data/products.ts` + seed script
- Animasi ringan: CSS transition + IntersectionObserver (scroll reveal)

## Struktur

```text
src/
├── app/
│   ├── layout.tsx            # Font, metadata, Navbar/Footer/Provider/AgeGate global
│   ├── page.tsx              # Home (Hero, Koleksi, Featured, Tentang, Jurnal, Newsletter)
│   ├── catalog/page.tsx      # Halaman katalog lengkap (dari DB)
│   ├── product/[id]/page.tsx # Halaman detail produk (dari DB)
│   ├── admin/                # CMS: login, dashboard produk & kategori
│   ├── api/admin/            # REST API admin (produk & kategori)
│   └── ...
├── components/payota/        # Navbar, Hero, ProductCard/Grid, Modal, Footer, ...
├── data/products.ts          # Data dummy: 10 produk, 4 kategori (Bahasa Indonesia)
└── lib/                      # supabase clients, admin-auth, payota-db, payota-admin
```

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:9002
npm run build
npm run typecheck
```

## Database, Migrasi & Seed

Konfigurasi di `.env` (copy dari `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only
SUPABASE_DB_URL=postgresql://... # untuk migrasi langsung
```

Jalankan migrasi (idempoten, mencatat versi di `schema_migrations`):

```bash
node scripts/migrate.mjs
```

Seed 4 kategori + 10 produk dummy ke database (upsert berdasarkan slug):

```bash
node scripts/seed-payota.mjs
```

## Endpoint API admin (semua butuh cookie sesi)

- `POST /api/admin/login` · `POST /api/admin/logout`
- `GET|POST /api/admin/products` · `GET|PATCH|DELETE /api/admin/products/[id]`
- `GET|POST /api/admin/categories` · `PATCH|DELETE /api/admin/categories/[id]`

## Ganti Data Produk

Edit `src/data/products.ts` lalu jalankan `node scripts/seed-payota.mjs`, atau kelola langsung
dari CMS admin. Gambar produk digambar otomatis sebagai render SVG premium (tidak ada broken
image); bila ingin foto asli, atau kelola lewat kolom `image` di `<ProductImage />`.

## Verifikasi usia

Situs memiliki age gate "21+" (pernyataan mandiri, disimpan 30 hari per perangkat) sebelum konten
dibuka untuk pengunjung.