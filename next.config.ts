
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Root proyek eksplisit — mencegah Next.js salah infer (ada lockfile lain
  // di direktori induk) yang bisa bikin path build/cache melenceng.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  // Tree-shake agresif untuk library besar → bundle lebih kecil.
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    // Sumber gambar (Supabase Storage) sudah berformat WebP hasil kompresi
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
