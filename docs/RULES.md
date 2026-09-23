# Aturan Pengembangan (Rules) – Fee Rainbow Padang v1.1

## 1. Tata Letak & Grid (Kritikal)
- **Desktop Grid (Large Screens)**: Wajib menggunakan sistem **6 kolom** (`lg:grid-cols-6`) untuk seluruh daftar visual (Katalog & Portofolio).
- **Tablet Grid**: Wajib menggunakan sistem **3 kolom** (`md:grid-cols-3`).
- **Mobile Grid**: Wajib menggunakan sistem **2 kolom** (`grid-cols-2`).
- **Spacing**: Gunakan jarak antar kolom yang rapat namun bersih (`gap-x-3 gap-y-10`).

## 2. Sistem Tipografi (Elegant & Compact)
- **Header Beranda**: Ukuran maksimal `text-5xl` atau `text-6xl` di desktop untuk menghindari overlap header. Gunakan `tracking-tighter`.
- **Sub-header / Labels**: Gunakan font mikro (8px-10px) untuk label teknis dengan tracking lebar (`tracking-[0.4em]`).
- **Font Headers**: Menggunakan **Plus Jakarta Sans** dengan bobot extra-bold/black.
- **Font Body**: Menggunakan **Inter** untuk keterbacaan maksimal dengan gaya italic pada kutipan.

## 3. Komposisi Kartu (Cards)
- **Radius**: Gunakan `rounded-[1.8rem]` untuk kartu portofolio agar terlihat lebih modern dan tidak terlalu membulat.
- **Theme Colors**: Gunakan warna **Magenta (#E91E63)** sebagai warna primer. Hindari Navy sama sekali.
- **Views Badge**: Gunakan hitam transparan (`bg-black/40`) dengan backdrop blur untuk kontras tinggi di atas gambar.

## 4. Navigasi & UI
- **Safe Zone**: Gunakan `pt-32` pada halaman beranda dan `pt-44` pada halaman katalog untuk memastikan konten tidak tertutup header sticky.
- **Brand Consistency**: Seluruh elemen interaktif wajib menggunakan palet Magenta (#E91E63) dan Cream (#FFFDF9).
- **Interactive States**: Efek hover pada kartu produk harus menyertakan transformasi skala halus (`hover:scale-105`) dan bayangan lembut.