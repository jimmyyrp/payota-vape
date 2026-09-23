"use client";

import React from 'react';
import { 
  ShieldCheck, ArrowLeft, Database, UserCheck, 
  Lock, Cookie, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 bg-background text-left selection:bg-primary/20 overflow-x-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-6 text-center border-b border-border/60 pb-14 mb-16">
          <div className="w-16 h-16 bg-secondary rounded-[2rem] flex items-center justify-center text-primary mx-auto border border-border shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-primary font-black tracking-[0.6em] uppercase text-[10px] block">PROTEKSI DATA PELANGGAN</span>
            <h1 className="text-4xl md:text-5xl font-headline text-foreground tracking-tighter uppercase font-black">Kebijakan Privasi</h1>
            <p className="text-muted-foreground/70 font-bold italic text-[10px] uppercase tracking-[0.3em]">Terakhir Diperbarui: September 2026</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><Database size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">1. Klasifikasi Data Koleksi</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Kami hanya mengumpulkan parameter data yang esensial untuk koordinasi pesanan Anda: Nama Lengkap, Nomor Kontak (WhatsApp), dan Preferensi Produk. Data ini diproses secara internal untuk kepentingan logistik teknis pengiriman.</p>
              <p>Data navigasi anonim (Cookies) digunakan semata-mata untuk sistem favorit katalog agar memudahkan Anda menemukan kembali produk yang Anda sukai.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><Lock size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">2. Protokol Keamanan & Enkripsi</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Seluruh transmisi data di platform Vape Store dilindungi oleh enkripsi SSL. Kami menjamin kerahasiaan identitas pelanggan dan tidak akan membagikannya kepada pihak ketiga.</p>
              <p>Vape Store tidak pernah menyewakan atau menjual basis data pelanggan untuk kampanye pemasaran apa pun di luar ekosistem layanan kami.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><UserCheck size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">3. Hak Kedaulatan Pelanggan</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Pelanggan memiliki hak untuk meminta penghapusan permanen data pesanan dari sistem kami setelah seluruh kewajiban transaksi selesai.</p>
              <p>Permintaan penghapusan data dapat diajukan secara formal melalui layanan bantuan resmi WhatsApp dengan verifikasi identitas.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-4 text-primary border-b border-border/60 pb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-inner"><Cookie size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">4. Kebijakan Cookies</h2>
            </div>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-[12px] italic">
              <p>Kami menggunakan Cookies pihak pertama untuk menyimpan daftar 'Favorit Saya' di browser Anda. Data ini disimpan secara lokal dan tidak dilacak lintas-situs.</p>
              <p>Penggunaan cookies ini bertujuan untuk meningkatkan kenyamanan navigasi Anda dalam menjelajahi katalog produk kami.</p>
            </div>
          </section>

          <section className="space-y-5 md:col-span-2 bg-card p-10 rounded-[2.5rem] border border-border flex items-start gap-6 shadow-sm">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0"><RefreshCw size={24} /></div>
            <div className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Pembaruan & Transparansi Protokol</h2>
              <p className="text-muted-foreground font-medium leading-relaxed text-[12px] italic">
                Vape Store berhak memperbarui kebijakan privasi ini secara berkala sesuai regulasi perlindungan data di Indonesia. Dengan terus menggunakan layanan kami, Anda dianggap menyetujui kerangka kerja perlindungan data yang berlaku.
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