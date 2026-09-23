# Aturan Pengembangan (Rules) – Vape Store v1.1

## 1. Tema (Dark Only — Wajib)
- **Tidak ada mode terang.** Seluruh UI memakai token dark dari `src/app/globals.css` (CSS variables).
- Warna primer ungu gelap (HSL `265 84% 64%`, token `--primary`); permukaan memakai token `background`, `card`, `popover`, `secondary`, `muted`, `border`.
- **DILARANG** hardcode warna terang florist: `bg-white` (pakai `bg-card`), `#FFFDF9`, `#4D0F28`, `#E91E63`, dan palet pink/maroon.
- Jangan pernah menulis `#E91E63` / `#fda4af` / `#f472b6` — ganti dengan palet ungu (`#8B5CF6`, `#A78BFA`, `#C4B5FD`).
- Latar utama: `bg-background`; kartu: `bg-card`; border: `border-border`.

## 2. Tata Letak & Grid (Kritikal)
- **Desktop Grid (Large Screens)**: Wajib sistem **6 kolom** (`lg:grid-cols-6`) untuk daftar visual (Katalog & Produk).
- **Tablet Grid**: Wajib **3 kolom** (`md:grid-cols-3`).
- **Mobile Grid**: Wajib **2 kolom** (`grid-cols-2`).
- **Spacing**: Jarak antar kolom rapat namun bersih (`gap-x-3 gap-y-10`).

## 3. Sistem Tipografi (Compact)
- **Header Beranda**: maks. `text-5xl`/`text-6xl` di desktop, `tracking-tighter`.
- **Label teknis**: font mikro (8px–10px) dengan tracking lebar (`tracking-[0.4em]`).
- **Font**: Plus Jakarta Sans untuk header (black/extra-bold), Inter untuk body.
- **Konten teks pada kartu gelap**: gunakan `text-foreground`/`text-muted-foreground`, bukan `text-white/xx` yang disalin dari desain lama.

## 4. Komposisi Kartu (Cards)
- **Radius** kartu: `rounded-[1.8rem]`.
- **Views Badge**: `bg-black/40 backdrop-blur` tetap oke — kontras tinggi di atas gambar.

## 5. Navigasi & UI
- **Safe Zone**: `pt-32` pada beranda, `pt-44` pada katalog, agar tidak tertutup header sticky.
- **Interactive States**: hover kartu menyertakan `hover:scale-105` (atau translasi) + bayangan lembut.

## 6. Domain Vape
- Istilah produk: **liquid**, **mod/device**, **pod**, **disposable**, **aksesoris**.
- DILARANG memakai istilah florist: bunga, buket, papan bunga, rangkaian, vase, dsb.
- Tidak ada fitur **seasonal/event** — jangan menambahkan kembali.