# Skema Data Dinamis – Vape Store v1.0

## 1. Tabel Utama: `products` (Produk Katalog)
- `id`: SERIAL (PK)
- `title`: String (Judul Produk)
- `price`: Numeric (Harga; 0 = harga menyusul)
- `views`: Integer (Analitik Tayangan)
- `is_active`: Boolean (Status Publikasi)
- `created_at`: TIMESTAMPTZ
- `deleted_at`: TIMESTAMPTZ (Soft-Delete)
- `sub_category_id`: FK ke `sub_categories` (sub utama untuk halaman detail)

## 2. Tabel Relasi
- `categories`: Kategori induk (Liquid, Mod/Device, Pod, Disposable, Aksesoris, dll).
- `sub_categories`: Sub-kategori / varian.
- `product_categories`: Link Many-to-Many Produk ke Kategori.
- `product_sub_categories`: Link Many-to-Many Produk ke Sub-kategori.

## 3. Tabel Konten & Media
- `product_images`: Galeri visual (url_images, urutan).
- `reviews`: Ulasan pelanggan yang divalidasi.
- `review_tokens`: Token akses untuk pemberian ulasan.
- `settings`: Konfigurasi WhatsApp, Alamat, dan Media Sosial.
- `activity_logs`: Log aktivitas admin.
- `users`: Akun staff (admin/developer).
- `admin_sessions`: Sesi staf (token di-hash) untuk verifikasi peran server-side.
- `themes`: Tema warna dinamis.
- `schema_migrations`: Pengelola migrasi inkremental.

## 4. Fungsi RPC Kritis
- `login_user(p_username, p_password)`: Otorisasi portal staf; menghasilkan `session_token`.
- `verify_admin_session(p_token)`: Validasi sesi + peran (admin/developer) untuk endpoint sensitif.
- `revoke_admin_session(p_token)`: Mencabut sesi saat logout.
- `get_products_complete()`: Query relasional lengkap untuk katalog.
- `increment_product_views(target_id)`: Logika penghitung tayangan aman.
- `submit_review_with_token(...)`: Validasi token + simpan ulasan pelanggan.
- `get_activity_log(...)`: Riwayat aktivitas admin.
- `cleanup_expired_records()`: Protokol pembersihan data usang (juga sesi kedaluwarsa).

> Sumber kebenaran tunggal migrasi: `migrations/001_vape_store_schema.sql`.
> Tidak ada tabel/event musiman — fitur seasonal dihapus permanen.