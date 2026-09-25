"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  Info,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";

function Card({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="card-surface p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </span>
        <h2 className="font-headline text-xs font-extrabold uppercase tracking-[0.24em] text-foreground">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function HelpPanel() {
  return (
    <div className="space-y-4">
      <section className="card-surface relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(228,228,231,0.12), transparent 55%)",
          }}
        />
        <div className="relative">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            <BookOpen className="h-4 w-4" aria-hidden />
            Pusat Bantuan Admin
          </p>
          <h1 className="mt-2 font-headline text-xl font-extrabold tracking-tight text-foreground">
            Panduan Memakai Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Halaman ini menjelaskan cara mengelola katalog PAYOTA — menambah produk &
            kategori, mengatur foto dan spesifikasi, sampai mempublikasikan ke situs.
            Baca sesuai kebutuhan; semua tindakan berbahaya selalu meminta konfirmasi
            dua langkah sehingga tidak ada data yang terhapus tanpa sengaja.
          </p>
        </div>
      </section>

      <Card icon={<CheckCircle2 className="h-4 w-4" aria-hidden />} title="Mulai Menggunakan">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <b className="text-foreground">Siapkan kategori dulu.</b> Buka menu{" "}
            <b className="text-foreground">Kategori</b>, lalu tambahkan misalnya
            "Perangkat", "Aksesori", atau "Esensial". Kategori yang tidak diaktifkan
            tidak akan tampil di situs.
          </li>
          <li>
            <b className="text-foreground">Tambahkan produk.</b> Buka menu{" "}
            <b className="text-foreground">Produk</b> &gt; tombol{" "}
            <b className="text-foreground">Tambah</b>. Isi nama, tagline, harga,
            foto, dan spesifikasi.
          </li>
          <li>
            <b className="text-foreground">Aktifkan produk.</b> Produk baru secara
            bawaan sudah <b className="text-foreground">Aktif</b>. Kalau belum
            yakin penampilannya, simpan dengan status{" "}
            <b className="text-foreground">Aktif</b> mati, periksa dulu, lalu
            diaktifkan dari daftar.
          </li>
          <li>
            <b className="text-foreground">Cek tampilan publik.</b> Tekan{" "}
            <b className="text-foreground">Buka Situs</b> di sidebar untuk melihat
            hasilnya seperti pengunjung.
          </li>
        </ol>
      </Card>

      <Card icon={<FileText className="h-4 w-4" aria-hidden />} title="Mengelola Produk">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Isian pada form "Tambah / Edit Produk"
        </p>
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Kolom</th>
                <th className="px-3 py-2.5">Kegunaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Nama</td>
                <td className="px-3 py-2.5">Nama produk utama, contoh "PAYOTA Box Nano".</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Kategori</td>
                <td className="px-3 py-2.5">
                  Kelompok produk. Pilihan muncul dari daftar kategori yang sudah ada.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Urutan</td>
                <td className="px-3 py-2.5">
                  Nomor kecil tampil lebih dulu. Gunakan 0, 1, 2, … lalu sebar 10, 20, 30
                  agar mudah menyisipkan angka baru nanti.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Harga</td>
                <td className="px-3 py-2.5">
                  Ditulis bebas, contoh "Rp 450.000", "Rp 380.000 – Rp 420.000", atau
                  "Hubungi Admin".
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Badge</td>
                <td className="px-3 py-2.5">
                  Label pendek di kartu produk, mis. "Baru", "Terbatas", "Unggulan".
                  Kosongkan jika tidak perlu.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Tagline</td>
                <td className="px-3 py-2.5">
                  Satu kalimat singkat penarik minat di bawah nama.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Deskripsi</td>
                <td className="px-3 py-2.5">
                  Cerita lengkap produk, boleh lebih dari satu paragraf.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Spesifikasi</td>
                <td className="px-3 py-2.5">
                  Daftar label & nilai, contoh "Kapasitas Baterai : 1500 mAh".
                  Bisa diisi cepat lewat kotak pencarian spesifikasi (lihat bagian
                  "Spesifikasi").
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Unggulan</td>
                <td className="px-3 py-2.5">
                  Bintang emas. Produk "Unggulan" tampil lebih menonjol di beranda.
                  Sebaiknya jangan terlalu banyak sekaligus.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-foreground">Aktif</td>
                <td className="px-3 py-2.5">
                  Matikan untuk menyembunyikan produk dari situs tanpa menghapus data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card icon={<ImageIcon className="h-4 w-4" aria-hidden />} title="Foto Produk">
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Foto diubah otomatis menjadi <b className="text-foreground">WebP</b> dan
              disimpan di <b className="text-foreground">Supabase Storage</b> (bucket
              publik "products") — bukan di database, sehingga situs tetap ringan.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Ukuran maksimal <b className="text-foreground">4 MB</b>. Foto yang lebih
              besar akan diblokir dan muncul pesan kesalahan.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Saat menyimpan ulang produk, foto lama di storage{" "}
              <b className="text-foreground">otomatis dihapus</b> dan diganti foto baru.
              Menghapus produk juga ikut menghapus fotonya.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Search className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
            <span>
              Jika foto gagal dimuat, pastikan file berformat JPG/PNG/WebP dan ukurannya
              di bawah 4 MB, lalu coba lagi.
            </span>
          </li>
        </ul>
      </Card>

      <Card icon={<Layers className="h-4 w-4" aria-hidden />} title="Spesifikasi Produk">
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Ada <b className="text-foreground">daftar spesifikasi umum</b> yang sudah
              disiapkan (Baterai, Daya &amp; Mode, Pengisian, Coil &amp; Pod, Material,
              Layar). Ketik kata kunci pada kotak "Cari &amp; tambah spesifikasi"
              misalnya <i>baterai</i>, lalu pilih — baris terisi otomatis.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Saat belum mengetik, daftar tampil berkelompok per jenis agar cepat dipilih.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Pencil className="mt-0.5 h-4 w-4 shrink-0 text-[15px] text-foreground" aria-hidden />
            <span>
              Butuh spesifikasi khusus? Pakai{" "}
              <b className="text-foreground">"Tambah Baris"</b> lalu tulis label & nilai
              sendiri.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
            <span>
              Nilai yang sama dengan label yang sama tidak akan ditambahkan dua kali,
              jadi daftar spesifikasi selalu bersih.
            </span>
          </li>
        </ul>
      </Card>

      <Card icon={<Layers className="h-4 w-4" aria-hidden />} title="Kategori">
        <p>
          Kategori adalah wadah produk. Saat kategori{" "}
          <b className="text-foreground">dinonaktifkan</b>, kategori tersebut tidak
          tampil di situs — tetapi produk di dalamnya tidak hilang. Jika sebuah kategori
          masih dipakai banyak produk, sebaiknya produk dipindah dulu ke kategori lain
          sebelum kategori dihapus.
        </p>
      </Card>

      <Card icon={<Lightbulb className="h-4 w-4" aria-hidden />} title="Publikasi & Tampilan Situs">
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Perubahan langsung tampil setelah halaman situs di-refresh; tidak perlu
              membangun ulang.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Star className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Produk <b className="text-foreground">Unggulan</b> dan{" "}
              <b className="text-foreground">Aktif</b> diprioritaskan di beranda dan
              katalog.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
            <span>
              Alamat setiap produk dibuat otomatis dari namanya (mis. "PAYOTA Box" →
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs">/product/payota-box</code>).
            </span>
          </li>
        </ul>
      </Card>

      <Card icon={<ShieldCheck className="h-4 w-4" aria-hidden />} title="Keamanan">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Sesi admin disimpan aman selama <b className="text-foreground">30 hari</b>.{" "}
              Selalu tekan <b className="text-foreground">Logout</b> bila selesai,
              terutama di perangkat bersama.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Halaman dashboard & API admin hanya bisa dipakai setelah login. Data publik
              di katalog hanya membaca produk yang statusnya "Aktif".
            </span>
          </li>
        </ul>
      </Card>

      <Card icon={<AlertTriangle className="h-4 w-4" aria-hidden />} title="Cepat Mengatasi Masalah">
        <div className="space-y-2">
          <p>
            <b className="text-foreground">Produk tidak muncul di situs?</b> Pastikan
            status <b className="text-foreground">Aktif</b> menyala (kartunya terlihat
            normal, tidak gelap) dan nama kategorinya tercantum di daftar Kategori.
          </p>
          <p>
            <b className="text-foreground">Foto gagal disimpan?</b> Periksa ukuran file
            (maksimal 4 MB) dan format (JPG/PNG/WebP). Foto lama berbasis data tersimpan
            di memori browser akan dipindah otomatis ke storage saat produk disimpan ulang.
          </p>
          <p>
            <b className="text-foreground">Halaman situs masih lama?</b> Dashboard
            memakai cache sesaat untuk beberapa daftar — muat ulang halaman atau tunggu
            beberapa menit.
          </p>
          <p>
            <b className="text-foreground">Tidak sengaja menonaktifkan produk?</b> Cari
            nama produk di kolom pencarian, lalu tekan saklar<b> Aktif</b> pada kartunya.
          </p>
        </div>
      </Card>

      <aside className="flex items-start gap-3 rounded-[1.25rem] border border-white/[0.08] bg-[#0D0D0D] p-4 text-xs leading-relaxed text-muted-foreground">
        <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <p>
          <b className="text-foreground">Tips terpenting:</b> Hapus produk/kategori
          selalu melewati dialog konfirmasi dua langkah dan muncul pemberitahuan hasil.
          Jika Anda ragu, jangan hapus — cukup matikan status{" "}
          <b className="text-foreground">Aktif</b>; datanya tetap aman dan bisa
          diaktifkan kembali kapan saja.
        </p>
      </aside>
    </div>
  );
}