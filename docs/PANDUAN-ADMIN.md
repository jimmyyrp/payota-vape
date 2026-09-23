# PANDUAN LENGKAP — Sistem Fee Rainbow Padang

> Referensi resmi penggunaan panel admin (`/admin`), situs publik, dan konsol developer.
> Versi terbaru selalu tersedia di dalam aplikasi: **Admin → menu "Panduan"** (`/admin/panduan`).

---

## 1. AKSES & OTENTIKASI

### 1.1 Masuk Sistem
| Langkah | Detail |
|---|---|
| 1 | Buka situs → tombol **Login Staff** (pojok kanan atas), atau langsung ke `/login` |
| 2 | Isi **ID Pengguna** + **Kode Rahasia** |
| 3 | Tekan **MASUK SISTEM** |

- Password diverifikasi server-side dengan bcrypt (`pgcrypto`) — tidak pernah tersimpan sebagai teks biasa.
- Trigger database `trigger_hash_password` mengenkripsi otomatis setiap password baru/perubahan.

### 1.2 Level Akun (Role)
| Role | Hak Akses |
|---|---|
| `staff` (Content Staff) | Dasbor, Karya, Katalog, Testimoni |
| `admin` (Super Admin) | Semua akses staff + **Kelola Tim** + **Pengaturan** |
| `developer` (System Developer) | Semua akses admin + **Konsol Developer**; satu-satunya role yang boleh membuat/menghapus akun developer |

### 1.3 Keluar
Sidebar kiri → ikon keluar → konfirmasi. Sesi disimpan di localStorage (`fee_admin_auth`, `fee_user_role`, `fee_user_name`) dan token sesi (`fee_session_token`) dicabut dari server saat logout.

> **Catatan keamanan:** Endpoint sensitif (`/api/maintenance`, `/api/revalidate`) kini memverifikasi peran (admin/developer) lewat database, bukan lewat secret ENV. Jika tombol di panel Developer tiba-tiba menolak dengan "sesi tidak valid", cukup **logout lalu login kembali** untuk mendapatkan token sesi baru.

---

## 2. DASBOR (`/admin`)
- **Total Tayangan** — akumulasi view semua karya.
- **Arsip Karya** — jumlah karya aktif.
- **Testimoni** — jumlah ulasan aktif.
- **Tim Pengelola** — jumlah akun staf.
- Grafik **5 Karya Terpopuler** berdasarkan view.

---

## 3. MANAJEMEN KARYA (`/admin/portofolio`)

### 3.1 Menerbitkan Karya Baru
1. Tombol **TERBITKAN BARU**.
2. Field form:
   - **Judul** — wajib.
   - **Harga (IDR)** — wajib angka ≥ 0 (0 = harga menyusul/konsultasi).
   - **Deskripsi** — opsional, maks. 2000 karakter.
   - **Media Visual** — 1–5 foto; foto ke-1 = thumbnail otomatis; alat crop rasio P(3:4)/S(1:1)/L(4:3); drag-and-drop untuk urutan.
   - **Kategori** — dropdown; minimal 1 kategori.
   - **Sub Kategori** — dropdown; **pilihan pertama menjadi sub kategori utama** yang tampil di halaman detail publik.
   - **Tayangkan di Galeri Publik** — centang agar langsung live.
3. Tekan **SIMPAN ARSIP**. Validasi inline muncul bila ada field tidak valid.

### 3.2 Mengubah / Menghapus
- **Edit** (ikon pensil): semua field dapat diubah; foto yang dibuang dari galeri ikut dihapus permanen dari Cloudinary.
- **Hapus** (ikon tempat sampah): *soft delete* — disembunyikan dari publik & daftar admin, baris data tetap ada (`deleted_at` terisi) sehingga masih dapat dipulihkan lewat database oleh developer.

### 3.3 Sinkronisasi Otomatis saat Simpan
Sistem menulis sekaligus:
- Junction `post_categories` + `post_sub_categories` + `post_images`,
- Kolom langsung `posts.sub_category_id` (= sub pertama) untuk halaman detail,
- `posts.gambar_thumbnail` (= foto pertama) untuk audit aset & cadangan.

---

## 4. KATALOG LAYANAN (`/admin/services`)
Struktur: **11 Kategori Induk** → **26 Sub-Kategori**.

Contoh hierarki:
```
Buket            → Wisuda, Frame Foto, Boneka, Butterfly, Coklat, ... (11 sub)
Bouquet Bunga    → Artificial, Fresh Flower, Korean, Money, Round, Thumbelina
Bloombox         → Bloombox (koleksi tunggal)
```

Operasi:
- **Tambah/Ubah**: tab KATEGORI atau SUB-KATEGORI → tombol Tambah/pensil.
  - Sub wajib punya induk; kolom **Estimasi Mulai (IDR)** = harga awal di publik.
  - Toggle **"Aktif & tampil di halaman publik"** untuk sembunyikan tanpa menghapus.
- **Hapus**: proteksi **Data Shield** — item yang masih dipakai karya tidak dapat dihapus. Pindahkan dulu karyanya.

---

## 5. KELOLA TIM (`/admin/users`) — Admin & Developer
- **Registrasi Anggota**: nama lengkap, ID (`[a-z0-9_]`, 3–30 char), password min. 6 char, pilih otoritas.
- **Ubah Data Staf**: ikon pensil → ubah nama/ID/otoritas; **kosongkan password bila tidak diganti**.
- **Reset password staf**: edit staf → isi password baru → simpan.
- **Hapus**: PERMANEN (bukan soft delete). Akun developer hanya dapat dihapus oleh sesama developer.

---

## 6. TESTIMONI & TOKEN (`/admin/testimonials`)
### Alur Token
1. **BUAT AKSES** → tentukan maksimal pemakaian → token dibuat.
2. Ikon salin → tautan format `{domain}/review/{token}` → kirim ke klien via WhatsApp.
3. Klien mengisi rating + ulasan → masuk otomatis ke panel & situs publik.

### Pengelolaan Ulasan
- **Pensil**: perbaiki nama, peran, isi, atau rating (1–5).
- **Tempat sampah**: hapus permanen.

---

## 7. PENGATURAN SISTEM (`/admin/settings`) — Admin & Developer
Key-value yang dikelola:
`phone`, `whatsapp`, `instagram`, `tiktok`, `address`, `message`.

Setiap simpan otomatis memicu revalidate cache (`/api/revalidate`) agar situs publik segera memperbarui.

---

## 8. KONSOL DEVELOPER (`/admin/developer`)
- **Audit Media Cloudinary**: memindai aset vs referensi DB (`post_images`, `posts.gambar_thumbnail`, `site_settings`).
  - *Yatim* = tak terpakai; dihapus hanya setelah masa tenggang 7 hari.
  - *Referensi Rusak* = URL DB tidak ada di Cloudinary → investigasi.
  - Cron harian `/api/cron/media-cleanup` (header `CRON_SECRET`) membersihkan otomatis.
- **Backup SQL**: unduh salinan tabel inti (`.sql`).

---

## 9. SITUS PUBLIK (PERSPEKTIF PENGUNJUNG)
| Halaman | Fungsi |
|---|---|
| `/` Beranda | Hero, koleksi populer, testimoni, CTA WhatsApp |
| `/layanan` | Jelajah kategori/sub-kategori + grid karya |
| `/layanan/[id]` & `/portofolio/[id]` | Detail karya: galeri, harga, favorit, pesan WA |
| Favorit | Disimpan lokal di perangkat pengunjung |

---

## 10. FAQ / PEMECAHAN MASALAH

**Q: Karya tidak muncul di publik?**
Pastikan `is_active` aktif (centang tayang). Situs memakai cache ISR — simpan ulang data apa pun untuk memicu revalidate, lalu refresh.

**Q: Tidak bisa hapus kategori?**
Masih dipakai karya (proteksi Data Shield). Alihkan karya dulu.

**Q: Thumbnail salah foto?**
Thumbnail = galeri nomor 1. Geser foto yang diinginkan ke posisi pertama → simpan.

**Q: Bedanya "matikan tayang" vs "hapus"?**
Matikan tayang = sementara, tetap terlihat di daftar admin. Hapus = sampah (soft delete), hilang dari daftar; pemulihan hanya lewat database.

**Q: Staf lupa password?**
Kelola Tim → pensil → isi password baru → simpan.

**Q: Perubahan nama kategori tidak muncul di situs?**
Nama katalog tersinkron real-time; jika halaman masih lama, tunggu revalidate cache atau simpan ulang pengaturan apa pun.

---

*Dibuat otomatis bersama refaktor CRUD v2 — Agustus 2026.*
