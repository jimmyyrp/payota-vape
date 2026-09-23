import {
  LayoutDashboard, Settings, ImageIcon, Cigarette, MessageSquare, PenTool, Zap, ShieldCheck, Package
} from 'lucide-react';

export const siteConfig = {
  name: "Vape Store",
  tagline: "Katalog Vape & Liquid Terlengkap",
  phone: "",
  whatsapp: "",
  address: "",
  instagram: "",
  tiktok: "",
  linktree: "",
  est: "2026"
};

export const heroData = {
  title: "Katalog Vape & Liquid Terpercaya",
  subtitle: "Menghadirkan pilihan perangkat pod, mod device, liquid premium, dan disposable terbaik. Harga bersahabat dengan kualitas terjamin.",
  bgImage: "/hero.webp"
};

export const valueProps = [
  { icon: Zap, title: "Produk Original", desc: "Semua barang 100% original dengan garansi toko." },
  { icon: ShieldCheck, title: "Kualitas Terjamin", desc: "Liquid & device dicek satu per satu sebelum dikirim." },
  { icon: PenTool, title: "Stok Terupdate", desc: "Katalog selalu diperbarui sesuai stok terbaru di toko." },
  { icon: Package, title: "Pengiriman Cepat", desc: "Pesan hari ini, dikemas & kirim secepatnya." }
];

export const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog Produk', href: '/karya' },
  { label: 'Kategori', href: '/layanan' },
  { label: 'Bantuan', href: '/bantuan' },
];

export const adminNavLinks = [
  { label: 'Dasbor', href: '/admin', icon: LayoutDashboard },
  { label: 'Manajemen Produk', href: '/admin/karya', icon: ImageIcon },
  { label: 'Katalog Produk', href: '/admin/services', icon: Cigarette },
  { label: 'Testimoni', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export const faqs = [
  { q: "Apakah produk yang ditawarkan original?", a: "Ya. Semua perangkat dan liquid yang kami jual adalah produk original dengan garansi dari toko." },
  { q: "Apakah bisa konsultasi sebelum membeli?", a: "Bisa! Silakan hubungi admin kami via WhatsApp untuk konsultasi device, liquid, dan ketersediaan stok." },
  { q: "Bagaimana cara pemesanan?", a: "Pilih produk di katalog, lalu klik tombol WhatsApp untuk langsung terhubung dengan toko." }
];