'use client';

import React from 'react';
import { ShieldCheck, Clock, PenTool, Sparkles } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const commitments = [
  { icon: ShieldCheck, title: "Produk Original", desc: "Seluruh device & liquid dijamin keasliannya dan melalui pengecekan kualitas." },
  { icon: Clock, title: "Responsif Cepat", desc: "Konsultasi & pemesanan diproses dengan cepat melalui WhatsApp." },
  { icon: PenTool, title: "Rekomendasi Tepat", desc: "Bantu pilih perangkat & liquid sesuai budget dan kebutuhan Anda." },
  { icon: Sparkles, title: "Stok Terupdate", desc: "Katalog selalu mencerminkan stok terbaru yang tersedia di toko." }
];

export const CommitmentSection = () => {
  return (
    <section className="py-16 md:py-20 px-6 bg-background border-t border-border/60">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-1 mb-12">
           <span className="text-primary font-black text-[9px] uppercase tracking-[0.8em]">LAYANAN KAMI</span>
           <h2 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tighter">Kualitas Terjamin</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
           {commitments.map((item, i) => (
             <Card key={i} className="border-border bg-card hover:bg-primary transition-all duration-700 rounded-[2.5rem] p-8 md:p-10 group shadow-sm">
               <CardContent className="p-0 space-y-6 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-all duration-700 shadow-inner">
                    <item.icon size={26} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-[11px] group-hover:text-white transition-colors">{item.title}</h4>
                    <p className="text-[13px] text-muted-foreground group-hover:text-white/60 leading-relaxed font-medium italic transition-colors line-clamp-3">{item.desc}</p>
                  </div>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </section>
  );
};