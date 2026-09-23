# Fee Rainbow Padang – Premium Florist & Gift Specialist (v1.0 Production)

Platform digital profesional untuk layanan florist premium, buket bunga segar, papan bunga, dan hadiah spesial di Kota Padang, Sumatera Barat.

## 🚀 Fitur Utama (Production Ready)

- **Compact Visual Catalog**: Sistem grid 6-kolom desktop yang arsitektural untuk minim scrolling.
- **Dynamic Daily Hero**: Latar belakang beranda yang berganti otomatis setiap hari dari karya portofolio.
- **Advanced Filtering**: Filter karya berdasarkan Kategori, Tags, dan Urutan (Terbaru/Populer).
- **Client-Side Bookmarks**: Fitur simpan favorit lokal dengan sinkronisasi instan.
- **Staff Portal**: Panel admin terenkripsi untuk manajemen konten dan ulasan klien.
- **Modular Architecture**: Tipe, query, dan hook terpusat untuk kemudahan maintenance.

## 🛠️ Langkah Setup (Development)

### 1. Clone & Install

```bash
git clone <repo-url>
cd fee-rainbow-pdg
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env.local
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari dashboard Supabase Anda.

### 3. Setup Database (Supabase)

Isi `SUPABASE_DB_URL` di `.env` dari **Supabase Dashboard → Project Settings → Database → Connection string**. Jangan gunakan anon key atau service-role key sebagai password koneksi PostgreSQL.

Jalankan migration dari folder project:

```bash
npm run db:migrate
```

Runner membuat `public.schema_migrations`, menerapkan file `NNN_*.sql` berurutan, aman dijalankan berulang kali, dan memakai advisory lock agar dua proses tidak berjalan bersamaan. Data yang sudah ada tidak di-reset.

Lihat `migrations/README.md` untuk panduan lengkap.

### 4. Jalankan Development Server

```bash
npm run dev
```

Akses di `http://localhost:9002`

## 🛠️ Langkah Deployment (GitHub & Vercel)

### 1. Persiapan Repository

- Unggah seluruh kode ini ke repository **GitHub** Anda.

### 2. Deploy ke Vercel

- Hubungkan GitHub Anda di dashboard Vercel.
- Tambahkan **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Jalankan `npm run db:migrate` menggunakan environment lokal atau environment deployment yang memiliki `SUPABASE_DB_URL`.
- Klik **Deploy**.

## 💻 Perintah Pemeliharaan (CLI)

### Pembersihan Data Server (Hard Delete)

```bash
curl -X POST https://nama-aplikasi-anda.vercel.app/api/maintenance
```

### Pembersihan Cache Global

```bash
curl -X POST https://nama-aplikasi-anda.vercel.app/api/revalidate
```

## 🔄 Update Website yang AMAN (Data & Login Tidak Hilang)

Saat ingin memperbarui website di database yang SUDAH terpakai:

1. **Jangan pernah** menjalankan `setup.sql` (atau migration `001_initial_schema.sql`)
   secara manual di database produksi — file itu `DROP TABLE ... CASCADE` dan
   menghapus **seluruh data**: karya, akun staff, dan sesi login.
   Sekarang kedua file itu **memiliki safety guard** yang membatalkan eksekusi
   otomatis bila database sudah berisi data.
2. Untuk update skema yang aman, jalankan saja migrasi inkremental:
   ```bash
   npm run db:migrate
   ```
   Runner hanya menerapkan file `migrations/NNN_*.sql` yang **belum pernah**
   diterapkan (dicatat di tabel `schema_migrations`). Data lama tidak dihapus.

### Membersihkan Cache Setelah Update (Termasuk di HP)

Setelah deploy versi baru, buka panel **Admin → Developer → Cache Control** lalu
klik **PURGE ALL CACHE (AMAN)**. Tombol ini:

- Merevalidasi seluruh halaman di server (ISR/CDN Next.js).
- Membersihkan cache browser saat ini juga (localStorage non-esensial,
  sessionStorage, dan CacheStorage) sehingga HP pengunjung tidak lagi
  menampilkan versi lama.
- **Tidak menghapus** sesi login admin/staf dan bookmark favorit pengunjung
  (kunci `fee_*` yang aman dipertahankan), lalu memuat ulang halaman otomatis.

Bookmark favorit pengunjung tersimpan di `localStorage` per perangkat
(kunci `fee_bookmarks`) — aman dari update kode maupun bersihkan cache di atas.

## 📁 Struktur Project

```
src/
├── app/           # Halaman & route (Next.js App Router)
│   ├── admin/     # Panel admin (portofolio, services, users, dll)
│   ├── api/       # API routes (maintenance, revalidate)
│   └── ...        # Halaman publik (layanan, portofolio, bantuan)
├── components/    # Komponen UI (Header, Footer, home sections)
├── data/          # Data statis (site-data.ts)
├── hooks/         # Custom hooks (use-bookmarks, use-toast, use-admin-data)
└── lib/           # Utilitas terpusat
    ├── formatters.ts   # formatPrice, formatCompactNumber
    ├── queries.ts      # Supabase query functions
    ├── supabase.ts     # Supabase client
    └── types.ts        # Type definitions

  migrations/             # Database migration SQL files
  ├── 001_initial_schema.sql
  ├── 002_rpc_functions.sql
  ├── 003_rls_policies.sql
  └── README.md
```

---

_Merayakan Setiap Momen Berharga bersama Fee Rainbow Padang._
_Designed by Ran Dev - v1.0 Premium Release_
