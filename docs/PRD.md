# Dokumentasi Produk (PRD) – Vape Store v1.0

## 1. Visi & Tujuan
**Vape Store** adalah platform digital untuk toko vape: katalog visual liquid/mod/device/pod/disposable, informasi layanan, ulasan pelanggan, dan pemesanan instan via WhatsApp. Desain memakai tema gelap penuh, tidak ada mode terang, dan tidak mengandung fitur musiman.

## 2. Fitur Utama
- **Instant Order System**: Integrasi WhatsApp untuk pemesanan cepat (link dari setiap produk/layanan).
- **Compact Visual Catalog**: Grid 6-kolom desktop untuk minim scrolling.
- **Dynamic Inventory**: Kategori hanya tampil jika memiliki minimal satu produk aktif.
- **Customer Favorites**: Simpan produk favorit secara lokal per perangkat.
- **Staff Portal**: Panel admin terenkripsi untuk produk, layanan, ulasan, log aktivitas, users, dan pengaturan.
- **SEO**: JSON-LD `Store` (bukan Florist) + sitemap/robots dengan ISR.

## 3. Identitas Visual
- **Nama**: Vape Store.
- **Mode**: Dark-only (token `background`, `card`, `primary` ungu 265 84% 64%).
- **Aksen**: Palet ungu/violet (#8B5CF6, #A78BFA, #C4B5FD).
- **Tipografi**: Plus Jakarta Sans + Inter.

## 4. Non-Goals
- Tidak ada basis data florist (`posts`, `post_*`, `testimonials`, `site_settings`) — semua memakai skema umum (`products`, `reviews`, `settings`, `activity_logs`).
- Tidak ada RPC/event/RSP musiman.