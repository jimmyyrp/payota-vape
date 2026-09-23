# Skema Data Dinamis – Fee Rainbow Padang v1.0

## 1. Tabel Utama: `posts` (Karya Portofolio)
- `id`: SERIAL (PK)
- `title`: String (Judul Rangkaian)
- `price`: Numeric (Estimasi Harga)
- `views`: Integer (Analitik Tayangan)
- `is_active`: Boolean (Status Publikasi)
- `created_at`: TIMESTAMPTZ
- `deleted_at`: TIMESTAMPTZ (Soft-Delete)

## 2. Tabel Relasi
- `categories`: Kategori utama (Buket Segar, Papan Bunga, dll).
- `sub_categories`: Spesialisasi/Tags (Anniversary, Wisuda, Dukacita).
- `post_categories`: Link Many-to-Many Karya ke Kategori.
- `post_sub_categories`: Link Many-to-Many Karya ke Tags.

## 3. Tabel Konten & Media
- `post_images`: Galeri visual (url_images, urutan).
- `testimonials`: Ulasan klien yang divalidasi.
- `testimonial_tokens`: Token akses untuk pemberian ulasan.
- `site_settings`: Konfigurasi WhatsApp, Alamat, dan Media Sosial.
- `admin_sessions`: Sesi staf (token di-hash) untuk verifikasi peran server-side.

## 4. Fungsi RPC Kritis
- `login_user(p_username, p_password)`: Otorisasi portal staf; menghasilkan `session_token`.
- `verify_admin_session(p_token)`: Validasi sesi + peran (admin/developer) untuk endpoint sensitif.
- `revoke_admin_session(p_token)`: Mencabut sesi saat logout.
- `get_posts_complete()`: Query relasional lengkap untuk katalog.
- `increment_post_views(target_id)`: Logika penghitung tayangan aman.
- `cleanup_expired_records()`: Protokol pembersihan data usang (juga bersihkan sesi kedaluwarsa).
