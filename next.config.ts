
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Tree-shake agresif untuk library besar → bundle lebih kecil.
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Redirect permanen rute lama -> baru (SEO & bookmark tetap hidup).
  // Query string (mis. ?category=1&id=2) otomatis dipertahankan Next.js.
  async redirects() {
    return [
      { source: '/portofolio', destination: '/karya', permanent: true },
      { source: '/portofolio/:id', destination: '/karya/:id', permanent: true },
      { source: '/admin/portofolio', destination: '/admin/karya', permanent: true },
    ];
  },
  images: {
    // Sumber gambar (Supabase/Cloudinary) sudah berformat WebP hasil kompresi
    // saat upload. Membatasi ke WebP saja mencegah Vercel membuat varian AVIF
    // tambahan (1 gambar = 1 transformation, bukan 2).
    formats: ['image/webp'],
    // Mengurangi jumlah kandidat lebar srcset: setiap (url + width + quality)
    // unik dihitung sebagai 1 Image Transformation di Vercel.
    deviceSizes: [640, 768, 1024, 1366, 1920],
    imageSizes: [64, 128, 256, 384],
    // Gambar pada storage bersifat immutable (nama file unik per upload),
    // jadi output optimasi boleh disimpan CDN lebih lama: mengurangi
    // transformasi ulang. TTL 31 hari.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
