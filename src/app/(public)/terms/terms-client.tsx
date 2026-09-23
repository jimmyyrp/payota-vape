"use client";

import React from 'react';
import { FileText, ArrowLeft, Scale, Clock, ShieldAlert, Award, Gavel } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 bg-background text-left selection:bg-primary/20 overflow-x-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-6 text-center border-b border-border/60 pb-14 mb-16">
          <div className="w-16 h-16 bg-secondary rounded-[2rem] flex items-center justify-center text-primary mx-auto border border-border shadow-inner">
            <FileText size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-primary font-black tracking-[0.6em] uppercase text-[10px] block">PROTOKOL OPERASIONAL</span>
            <h1 className="text-4xl md:text-5xl font-headline text-foreground tracking-tighter uppercase font-black">Syarat & Ketentuan</h1>
            <p className="text-muted-foreground/70 font-bold italic text-[10px] uppercase tracking-[0.3em]">Pembaruan Terakhir: September 2026</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><Scale size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">1. Ketentuan Layanan</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Seluruh produk yang dipasarkan Vape Store tunduk pada ketersediaan stok. Kami berhak mengonfirmasi ulang ketersediaan produk sebelum pesanan diproses.</p>
              <p>Klien wajib memberikan informasi pemesanan yang benar, termasuk alamat pengiriman dan nomor kontak aktif.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><Clock size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">2. Prosedur Pembayaran</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Pesanan dianggap sah setelah pembayaran dikonfirmasi. Harga yang tercantum dapat berubah sesuai kebijakan toko; jumlah akhir disepakati sebelum pembayaran.</p>
              <p>Keterlambatan konfirmasi pembayaran dapat menyebabkan pergeseran jadwal pengiriman atau pembatalan sepihak oleh manajemen.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><ShieldAlert size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">3. Kebijakan Pembatalan</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Pembatalan pesanan yang sudah diproses dan dipacking tidak dapat dikembalikan biayanya (Non-refundable).</p>
              <p>Perubahan pesanan hanya diperbolehkan selama proses packing belum dimulai.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><Award size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">4. Hak Kekayaan Intelektual</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Seluruh dokumentasi produk Vape Store adalah hak milik intelektual manajemen. Kami berhak menggunakan dokumentasi tersebut untuk dokumentasi resmi.</p>
              <p>Klien dilarang mereproduksi atau menggunakan foto produk kami untuk kepentingan komersial pihak lain tanpa izin tertulis.</p>
            </div>
          </section>

          <section className="space-y-5 md:col-span-2 bg-card p-10 rounded-[2.5rem] border border-border flex items-start gap-6 shadow-sm">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0"><Gavel size={24} /></div>
            <div className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Tanggung Jawab Pengiriman</h2>
              <p className="text-muted-foreground font-medium leading-relaxed text-[12px] italic">
                Vape Store bertanggung jawab atas kondisi produk hingga diterima pembeli. Kerusakan yang terjadi setelah serah terima di lokasi penerima menjadi tanggung jawab penerima, kecuali disepakati lain sebelumnya.
              </p>
            </div>
          </section>
        </div>

        <div className="pt-20 text-center">
          <Button asChild variant="ghost" className="rounded-full px-12 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground hover:bg-secondary group transition-all">
            <Link href="/" className="flex items-center gap-4">
              <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> KEMBALI KE BERANDA
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}