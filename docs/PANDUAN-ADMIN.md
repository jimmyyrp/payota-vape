# PANDUAN LENGKAP — Vape Store

> Referensi resmi penggunaan panel admin (`/admin`), situs publik, dan konsol developer.
> Versi terbaru juga tersedia di dalam aplikasi: **Admin → "Panduan"** (`/admin/panduan`).

---

## 1. AKSES & OTENTIKASI

### 1.1 Masuk Sistem
| Langkah | Detail |
|---|---|
| 1 | Buka situs → tombol **Login Staff** (pojok kanan atas) |
| 2 | Isi **ID Pengguna** + **Kode Rahasia** |
| 3 | Tekan **MASUK SISTEM** |

- Password diverifikasi server-side dengan bcrypt (`pgcrypto`) — tidak pernah plaintext.
- Trigger DB mengenkripsi otomatis setiap password baru/perubahan.

### 1.2 Level Akun (Role)
| Role | Hak Akses |
|---|---|
| `admin` (Super Admin) | Dasbor, Produk, Layanan, Testimoni, Users, Pengaturan |
| `developer` (System Developer) | Semua akses admin + **Konsol Developer**; satu-satunya role yang boleh membuat/menghapus akun developer |

### 1.3 Keluar
Sidebar → ikon keluar → konfirmasi. Sesi di simpan di localStorage dan token sesi dicabut server saat logout.

> **Catatan keamanan:** Endpoint sensitif (`/api/maintenance`, `/api/revalidate`) memverifikasi peran lewat database. Bila tombol Developer menolak "sesi tidak valid", logout lalu login kembali.

---

## 2. DASBOR (`/admin`)
- **Total Tayangan** — akumulasi view semua produk.
- **Arsip Produk** — jumlah produk aktif.
- **Testimoni** — jumlah ulasan aktif.
- **Tim Pengelola** — jumlah akun staf.
- Grafik **5 Produk Terpopuler**.

---

## 3. MANAJEMEN PRODUK (`/admin/karya`)
Route panel memakai `/admin/karya` (kompatibilitas), menu menampilkan "Manajemen Produk".

### 3.1 Menerbitkan Produk Baru
1. Tombol **TERBITKAN BARU**.
2. Field form:
   - **Judul** — wajib (nama liquid/mod/pod/disposable).
   - **Harga (IDR)** — wajib angka ≥ 0 (0 = "harga menyusul/konsultasi").
   - **Deskripsi** — opsional, maks. 2000 karakter (varian rasa, nicotine, kelengkapan).
   - **Media Visual** — 1–5 foto; foto ke-1 = thumbnail otomatis; crop P(3:4)/S(1:1)/L(4:3); drag untuk urutan.
   - **Kategori** — dropdown; minimal 1.
   - **Sub Kategori** — dropdown; **pilihan pertama menjadi sub utama** yang tampil di halaman detail.
   - **Tayangkan di Publik** — centang agar langsung live.
3. **SIMPAN ARSIP**. Validasi inline bila ada field tidak valid.

### 3.2 Mengubah / Menghapus
- **Edit**: semua field bisa diubah; foto yang dibuang dihapus permanen dari Supabase Storage.
- **Hapus**: *soft delete* — `deleted_at` terisi, baris tetap ada untuk pemulihan oleh developer.

### 3.3 Sinkronisasi Otomatis saat Simpan
Menulis sekaligus: junction `product_categories` + `product_sub_categories` + `product_images`, kolom `products.sub_category_id` (sub pertama), dan thumbnail pertama.

---

## 4. KATALOG LAYANAN (`/admin/services`)
Struktur: **Kategori Induk** → **Sub-Kategori** (data terbaru disesuaikan; bawaan migrasi 3 induk / 11 sub).

Operasi:
- **Tambah/Ubah**: tab KATEGORI / SUB-KATEGORI → Tambah/pensil.
  - Sub wajib punya induk; **Estimasi Mulai (IDR)** = harga awal di publik.
  - Toggle aktif untuk sembunyikan tanpa hapus.
- **Hapus**: proteksi **Data Shield** — tidak bisa menghapus kategori/sub yang masih dipakai produk.

---

## 5. KELOLA TIM (`/admin/users`) — Admin & Developer
- **Registrasi**: nama lengkap, ID (`[a-z0-9_]`, 3–30 char), password min. 6 char, pilih otoritas.
- **Ubah**: pensil → ubah nama/ID/otoritas; kosongkan password bila tidak diganti.
- **Reset password**: isi password baru → simpan.
- **Hapus**: PERMANEN. Akun developer hanya bisa dihapus developer.

---

## 6. ULASAN & TOKEN (`/admin/testimonials`)
### Alur Token
1. **BUAT AKSES** → tentukan maksimal pemakaian → token dibuat.
2. Ikon salin → tautan `{domain}/review/{token}` → kirim ke pelanggan via WhatsApp.
3. Pelanggan isi rating + ulasan → masuk panel & situs publik.

### Pengelolaan
- **Pensil**: ubah nama, peran, isi, rating (1–5).
- **Tempat sampah**: hapus permanen.

---

## 7. PENGATURAN SISTEM (`/admin/settings`) — Admin & Developer
Key-value: `phone`, `whatsapp`, `instagram`, `tiktok`, `address`, `message`.
Simpan memicu revalidate cache agar situs publik segera memperbarui.

---

## 8. KONSOL DEVELOPER (`/admin/developer`)
- **Storage**: audit aset di Supabase Storage (`vape_media`) vs referensi DB (`product_images`, `products.gambar_thumbnail`, `settings`); buang aset yatim & perbaiki referensi rusak.
- **Backup SQL**: unduh salinan tabel inti (`.sql`).
- **Blueprint SQL**: jalankan skema terbaru (`001_vape_store_schema.sql`) hanya untuk DB kosong (ada safety guard).

---

## 9. SITUS PUBLIK
| Halaman | Fungsi |
|---|---|
| `/` Beranda | Hero, produk populer, ulasan, CTA WhatsApp |
| `/karya` | Galeri produk: filter kategori/sub, search, favorit, detail |
| `/layanan` & `/layanan/[id]` | Jelajah kategori/sub-kategori |
| `/review/[token]` | Form ulasan klik token |
| `/favorit` | Produk tersimpan di perangkat pengunjung |

---

## 10. FAQ / PEMECAHAN MASALAH

**Q: Produk tidak muncul di publik?**
Pastikan `is_active` aktif. Situs memakai cache ISR — simpan ulang data untuk memicu revalidate, lalu refresh.

**Q: Tidak bisa hapus kategori?**
Masih dipakai produk (Data Shield). Alihkan produk dulu.

**Q: Thumbnail salah foto?**
Thumbnail = foto galeri nomor 1. Geser yang diinginkan ke posisi pertama → simpan.

**Q: Staf lupa password?**
Kelola Tim → pensil → isi password baru → simpan.

**Q: Kontak/WhatsApp tidak tampil?**
Isi key di **Pengaturan** (`/admin/settings`). Header/Footer menaut langsung ke nilai tersebut.

---

*Diperbarui bersama rombakan Vape Store — September 2026.*