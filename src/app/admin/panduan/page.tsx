'use client';

/**
 * PanduanAdmin - Halaman bantuan & petunjuk penggunaan panel admin.
 * Konten statis terstruktur per modul (Accordion), selalu bisa diakses
 * dari sidebar untuk semua role.
 */

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  LogIn,
  LayoutDashboard,
  ImageIcon,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  Terminal,
  Globe,
  CircleHelp,
  ArrowRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

interface GuideStep {
  title: string;
  items: string[];
}

const GUIDE_SECTIONS: { id: string; icon: React.ElementType; label: string; desc: string; steps: GuideStep[] }[] = [
  {
    id: 'mulai',
    icon: LogIn,
    label: 'Memulai & Login',
    desc: 'Cara masuk sistem, keluar, dan arti tiap level akun.',
    steps: [
      {
        title: 'Masuk ke Panel Admin',
        items: [
          'Buka menu "Login Staff" di pojok kanan atas situs publik (atau di menu navigasi versi HP), lalu klik.',
          'Isi ID Pengguna dan Kode Rahasia Anda, lalu tekan MASUK SISTEM.',
          'Password tersimpan terenkripsi (bcrypt) di server — yang tersimpan bukan teks aslinya.',
        ],
      },
      {
        title: 'Level Akun (Role)',
        items: [
          'CONTENT STAFF: mengelola produk, katalog, testimoni, dan dasbor.',
          'SUPER ADMIN: semua akses staff + mengelola tim & pengaturan sistem.',
          'SYSTEM DEVELOPER: semua akses admin + konsol developer (audit media, backup SQL). Hanya developer yang boleh membuat/menghapus akun developer lain.',
        ],
      },
      {
        title: 'Keluar / Ganti Akun',
        items: [
          'Tekan tombol keluar di bagian bawah sidebar kiri.',
          'Konfirmasi, dan Anda akan kembali ke halaman utama.',
        ],
      },
    ],
  },
  {
    id: 'dasbor',
    icon: LayoutDashboard,
    label: 'Dasbor',
    desc: 'Ringkasan performa toko dalam satu layar.',
    steps: [
      {
        title: 'Statistik Utama',
        items: [
          'Total Tayangan: jumlah semua view produk.',
          'Arsip Produk: jumlah produk aktif di galeri produk.',
          'Testimoni: jumlah ulasan klien yang masuk.',
          'Tim Pengelola: jumlah akun staf terdaftar.',
        ],
      },
      {
        title: 'Produk Terpopuler',
        items: ['Grafik batang menampilkan 5 produk dengan view tertinggi — gunakan ini untuk menentukan produk yang layak dipromosikan.'],
      },
    ],
  },
  {
    id: 'produk',
    icon: ImageIcon,
    label: 'Manajemen Produk',
    desc: 'Menambah, mengubah, menyembunyikan, dan menghapus produk.',
    steps: [
      {
        title: 'Menerbitkan Produk Baru',
        items: [
          'Tekan "TERBITKAN BARU" di halaman Manajemen Produk.',
          'Judul wajib diisi; harga harus angka (boleh 0).',
          'Deskripsi opsional — maksimal 2000 karakter, gunakan untuk menjelaskan varian rasa, ukuran/nicotine, kelengkapan, dsb.',
          'Unggah 1-5 foto. Foto pertama otomatis menjadi thumbnail produk.',
          'Gunakan alat bingkai (P/S/L) untuk memotong foto sebelum unggah.',
          'Geser (drag) foto untuk mengubah urutan tampil di galeri.',
          'Kategori: pilih minimal 1 kategori (lewat dropdown).',
          'Sub Kategori: pilih melalui dropdown; pilihan PERTAMA menjadi sub kategori utama yang tampil di halaman detail.',
          'Centang "Tayangkan Produk di Galeri Publik" agar langsung terlihat pengunjung.',
        ],
      },
      {
        title: 'Mengubah Produk',
        items: [
          'Tekan ikon pensil pada kartu produk.',
          'Semua field dapat diubah; tombol simpan aktif setelah ada perubahan.',
          'Foto yang dihapus dari galeri juga ikut terhapus dari penyimpanan Supabase Storage secara permanen.',
        ],
      },
      {
        title: 'Menghapus & Menyembunyikan',
        items: [
          'Hapus = soft delete: produk disembunyikan dari publik dan daftar admin, datanya masih ada di database (dapat dipulihkan oleh developer).',
          'Ingin hanya sementara tidak tampil? Edit produk lalu hilangkan centang "Tayangkan".',
        ],
      },
      {
        title: 'Pencarian & Filter',
        items: [
          'Gunakan kotak pencarian untuk mencari judul produk.',
          'Filter per kategori induk untuk mempersempit daftar.',
        ],
      },
    ],
  },
  {
    id: 'katalog',
    icon: Briefcase,
    label: 'Katalog Layanan',
    desc: 'Struktur kategori & sub-kategori yang mendasari klasifikasi produk.',
    steps: [
      {
        title: 'Hierarki Katalog',
        items: [
          'KATEGORI adalah induknya (contoh: Pod & Mod Device, Liquid / E-Liquid, Disposable).',
          'SUB-KATEGORI adalah varian di bawah induknya (contoh: Pod System, Salt Nic, Disposable Bar).',
          'Saat ini terdapat 3 kategori induk dan 11 sub-kategori.',
        ],
      },
      {
        title: 'Tambah / Ubah',
        items: [
          'Pilih tab KATEGORI atau SUB-KATEGORI, lalu tekan tombol Tambah.',
          'Sub-kategori wajib punya kategori induk; kolom "Estimasi Mulai" adalah harga awal yang tampil di publik.',
          'Toggle "Aktif" mengatur apakah item tampil di halaman publik tanpa perlu menghapusnya.',
        ],
      },
      {
        title: 'Proteksi Hapus',
        items: [
          'Kategori/sub yang masih dipakai produk TIDAK BISA dihapus — sistem akan menolak dengan pesan Proteksi Data Shield.',
          'Pindahkan dulu produk-produk tersebut ke kategori lain, baru hapus.',
        ],
      },
    ],
  },
  {
    id: 'tim',
    icon: Users,
    label: 'Kelola Tim',
    desc: 'Registrasi, perubahan data, dan pencabutan akses staf. (Admin/Developer)',
    steps: [
      {
        title: 'Menambah Staf',
        items: [
          'Tekan "REGISTRASI ANGGOTA", isi nama lengkap, ID pengguna (huruf kecil/angka, 3-30 karakter), kode rahasia (min. 6 karakter), dan pilih otoritas.',
          'Password langsung terenkripsi di server — tidak ada yang bisa melihatnya, termasuk admin.',
        ],
      },
      {
        title: 'Mengubah Data Staf',
        items: [
          'Tekan ikon pensil pada baris staf.',
          'Ubah nama, ID, atau otoritas sesuai kebutuhan.',
          'Kosongkan kolom password jika tidak ingin menggantinya.',
        ],
      },
      {
        title: 'Mengeluarkan Staf',
        items: [
          'Hapus bersifat PERMANEN — akun langsung tidak bisa login.',
          'Lupa password staf? Gunakan edit, isi password baru, lalu informasikan ke staf terkait.',
        ],
      },
    ],
  },
  {
    id: 'testimoni',
    icon: MessageSquare,
    label: 'Testimoni & Token Akses',
    desc: 'Mengumpulkan ulasan klien lewat tautan privat.',
    steps: [
      {
        title: 'Membuat Tautan Ulasan',
        items: [
          'Tekan "BUAT AKSES", tentukan maksimal pemakaian (1 = sekali pakai).',
          'Salin tautan dengan ikon salin, lalu kirim ke klien via WhatsApp.',
          'Klien membuka tautan, memberi rating + ulasan, dan ulasannya otomatis tampil di panel ini serta situs publik.',
        ],
      },
      {
        title: 'Mengelola Ulasan',
        items: [
          'Ikon pensil: perbaiki ejaan nama, peran, isi ulasan, atau rating.',
          'Ikon tempat sampah: hapus ulasan permanen (kuota token yang terpakai akan longgar kembali jika token belum habis).',
        ],
      },
    ],
  },
  {
    id: 'pengaturan',
    icon: Settings,
    label: 'Pengaturan Sistem',
    desc: 'Identitas kontak bisnis yang tampil di seluruh situs. (Admin/Developer)',
    steps: [
      {
        title: 'Field yang Tersedia',
        items: [
          'Phone & WhatsApp: nomor kontak yang dipakai tombol pesan.',
          'Instagram & TikTok: tautan sosial media.',
          'Address: alamat toko.',
          'Message: pesan singkat/pengumuman di situs.',
        ],
      },
      {
        title: 'Simpan & Cache',
        items: [
          'Setelah simpan, sistem otomatis membersihkan cache agar perubahan langsung tampil.',
          'Jika suatu saat perubahan tidak terlihat, tunggu beberapa detik lalu muat ulang halaman publik.',
        ],
      },
    ],
  },
  {
    id: 'developer',
    icon: Terminal,
    label: 'Konsol Developer',
    desc: 'Perawatan teknis: aset gambar & cadangan database. (Developer)',
    steps: [
      {
        title: 'Audit Media Supabase Storage',
        items: [
          'Semua media produk (foto) tersimpan di bucket Supabase Storage `vape_media`.',
          "'Yatim' (orphan) = file yang tidak terhubung ke produk mana pun; bersihkan langsung dari tab Storage di Supabase Dashboard.",
          'Foto yang dihapus dari galeri produk ikut terhapus permanen dari penyimpanan.',
        ],
      },
      {
        title: 'Backup SQL',
        items: ['Mengunduh salinan data tabel inti dalam format .sql untuk keperluan arsip/migrasi.'],
      },
    ],
  },
  {
    id: 'situs-publik',
    icon: Globe,
    label: 'Situs Publik (Sisi Pengunjung)',
    desc: 'Pengingat bagaimana pengunjung menggunakan hasil kerja Anda.',
    steps: [
      {
        title: 'Alur Pengunjung',
        items: [
          'Beranda: hero, kategori populer, testimoni, CTA WhatsApp.',
          'Layanan: menjelajah kategori & sub-kategori, klik produk untuk detail.',
          'Detail produk: galeri foto, harga, tombol favorit, dan pemesanan via WhatsApp.',
          'Favorit: daftar produk yang disimpan pengunjung di perangkatnya.',
        ],
      },
    ],
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Produk baru tidak muncul di situs publik?',
    a: 'Pastikan produk dicentang "Tayangkan" (is_active). Jika sudah, tunggu sebentar atau muat ulang halaman publik — situs memakai cache yang diperbarui otomatis setiap kali Anda menyimpan data.',
  },
  {
    q: 'Tidak bisa menghapus kategori/sub-kategori?',
    a: 'Itu proteksi bawaan: item masih dipakai oleh satu atau lebih produk. Alihkan produk tersebut ke kategori lain terlebih dahulu.',
  },
  {
    q: 'Staf lupa password?',
    a: 'Admin membuka Kelola Tim → ikon pensil pada staf terkait → isi password baru → simpan. Beritahu staf untuk menggantinya sendiri belum didukung (ganti via admin).',
  },
  {
    q: 'Foto pertama bukan yang saya inginkan jadi thumbnail?',
    a: 'Thumbnail selalu mengikuti foto NOMOR 1 di galeri. Geser foto yang diinginkan ke posisi pertama lalu simpan.',
  },
  {
    q: 'Bedanya hapus produk dengan matikan tayang?',
    a: 'Matikan tayang = disembunyikan sementara, tetap ada di daftar admin dan mudah diaktifkan lagi. Hapus = masuk sampah permanen (soft delete); item hilang dari daftar dan hanya dapat dipulihkan lewat database.',
  },
];

export default function PanduanAdmin() {
  return (
    <div className="space-y-8 animate-fade-up text-left pb-20 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
            <HelpCircle size={24} />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter">Panduan Sistem</h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/30">Petunjuk lengkap penggunaan Vape Store</p>
          </div>
        </div>
      </div>

      {/* NAVIGASI CEPAT */}
      <div className="flex flex-wrap gap-2">
        {GUIDE_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="px-4 h-9 inline-flex items-center gap-2 rounded-xl bg-card border border-border/60 shadow-sm text-[8px] font-black uppercase tracking-widest text-primary/50 hover:text-primary hover:border-primary/20 transition-all"
          >
            <s.icon size={12} /> {s.label}
          </a>
        ))}
        <a
          href="#faq"
          className="px-4 h-9 inline-flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 shadow-sm text-[8px] font-black uppercase tracking-widest text-primary"
        >
          <CircleHelp size={12} /> FAQ
        </a>
      </div>

      {/* SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {GUIDE_SECTIONS.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-24 bg-card rounded-[2rem] border border-border/60 shadow-sm overflow-hidden">
            <div className="p-6 flex items-start gap-4 border-b border-primary/[0.03]">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <section.icon size={18} />
              </div>
              <div>
                <h2 className="text-[11px] font-headline font-bold text-foreground uppercase tracking-widest">{section.label}</h2>
                <p className="text-[9px] text-primary/30 font-medium mt-0.5">{section.desc}</p>
              </div>
            </div>
            <div className="px-4 py-2">
              <Accordion type="multiple" defaultValue={[`${section.id}-0`]}>
                {section.steps.map((step, i) => (
                  <AccordionItem key={i} value={`${section.id}-${i}`} className="border-none">
                    <AccordionTrigger className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:no-underline py-3 px-2 text-left">
                      {step.title}
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-4">
                      <ul className="space-y-2">
                        {step.items.map((item, j) => (
                          <li key={j} className="flex gap-2.5 text-[10px] leading-relaxed text-foreground/70 font-medium">
                            <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-primary/30" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div id="faq" className="scroll-mt-24 bg-primary rounded-[2rem] p-8 md:p-10 text-white shadow-xl">
        <h2 className="text-base font-headline font-bold uppercase tracking-tight flex items-center gap-3">
          <CircleHelp size={22} /> Pertanyaan Umum
        </h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((f, i) => (
            <details key={i} className="group bg-white/10 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none px-5 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-between gap-4">
                {f.q}
                <ArrowRight size={14} className="shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="px-5 pb-5 text-[11px] leading-relaxed text-white/80 font-medium">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button asChild variant="outline" className="rounded-xl h-11 px-6 border-primary/10 text-primary text-[10px] font-bold uppercase">
          <Link href="/" target="_blank">Lihat Situs Publik</Link>
        </Button>
        <Button asChild className="bg-primary hover:opacity-90 text-white rounded-xl h-11 px-6 text-[10px] font-bold uppercase shadow-lg border-none">
          <Link href="/admin">Kembali ke Dasbor</Link>
        </Button>
      </div>
    </div>
  );
}
