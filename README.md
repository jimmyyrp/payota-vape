# Vape Store – Katalog Katalog & Layanan Vape (Dark Theme) (v1.0 Production)

Platform digital untuk toko vape: katalog visual produk liquid/mod/device, layanan, ulasan pelanggan, dan panel admin terenkripsi. Tema gelap penuh, tanpa fitur seasonal event.

## Fitur Utama

- **Katalog Produk Compact**: Grid arsitektural dengan filter Kategori, Sub-kategori, dan urutan Terbaru/Populer.
- **Dynamic Daily Hero**: Latar beranda berganti otomatis dari produk katalog sehari-hari.
- **Bookmark Favorit**: Simpan produk favorit secara lokal dengan sinkronisasi instan.
- **Panel Admin Terenkripsi**: Manajemen produk, layanan, ulasan, users, log aktivitas, dan pengaturan.
- **Arsitektur Modular**: Tipe, query, dan hook terpusat untuk maintenance mudah.

## Langkah Setup (Development)

### 1. Install

```bash
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env.local
```

Isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` dari dashboard Supabase Anda.

### 3. Setup Database (Supabase)

Isi `SUPABASE_DB_URL` dari **Supabase Dashboard → Project Settings → Database → Connection string**. Pastikan memakai koneksi pooler/session (`postgres.<ref>` user) bila host langsung tidak resolve.

Jalankan migration:

```bash
npm run db:migrate
```

Runner membuat `public.schema_migrations`, menerapkan file `migrations/001_vape_store_schema.sql`, aman dijalankan berulang kali, dan memakai advisory lock agar dua proses tidak berjalan bersamaan. Data yang sudah ada tidak di-reset.

### 4. Jalankan Development Server

```bash
npm run dev
```

Akses di `http://localhost:9002`

## Deployment (Vercel)

- Hubungkan repository di dashboard Vercel.
- Tambahkan **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Jalankan `npm run db:migrate` di lingkungan yang memiliki `SUPABASE_DB_URL`.
- Klik **Deploy**.

## Perintah Pemeliharaan (CLI)

- Pembersihan data server: `curl -X POST https://<app>.vercel.app/api/maintenance`
- Pembersihan cache global: `curl -X POST https://<app>.vercel.app/api/revalidate`

## Update Website yang AMAN (Data & Login Tidak Hilang)

1. **Jangan pernah** menjalankan migration secara manual di produksi — file tersebut `DROP SCHEMA public CASCADE` dan menghapus seluruh data. File sudah punya safety guard yang membatalkan eksekusi bila database sudah berisi data.
2. Untuk update skema aman, jalankan `npm run db:migrate`; hanya file `NNN_*.sql` baru yang diterapkan (dicatat di `schema_migrations`).
3. Setelah deploy, buka **Admin → Developer → Cache Control** lalu **PURGE ALL CACHE (AMAN)** untuk merevalidasi ISR/CDN dan membersihkan cache browser tanpa menghapus sesi login admin maupun bookmark favorit pengunjung (kunci `site_*` dipertahankan).

## Struktur Project

```
src/
├── app/           # Halaman & route (Next.js App Router)
│   ├── admin/     # Panel admin (karya, services, users, dll)
│   ├── api/       # API routes (maintenance, revalidate, storage, logout)
│   └── ...        # Halaman publik (karya, layanan, review, bantuan)
├── components/    # Komponen UI (Header, Footer, home sections)
├── data/          # Data statis (site-data.ts)
├── hooks/         # Custom hooks (use-bookmarks, use-toast, use-admin-data)
└── lib/           # Utilitas terpusat
    ├── formatters.ts   # formatPrice, formatCompactNumber
    ├── queries.ts      # Supabase query functions
    ├── supabase.ts     # Supabase client
    └── types.ts        # Type definitions

migrations/
├── 001_vape_store_schema.sql   # Satu-satunya skema (tabel products, reviews, settings, dll)
└── README.md
```

---

_Vape Store — Dark Theme Katalog & Layanan._
_Designed by Ran Dev - v1.0 Premium Release_