import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mx-auto border border-primary/10">
          <span className="text-4xl font-headline font-black">404</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-[11px] text-primary/40 font-medium italic leading-relaxed">
            Halaman yang Anda cari sudah dipindahkan atau tidak tersedia.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-primary hover:opacity-90 text-white rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          KEMBALI KE BERANDA
        </Link>
      </div>
    </div>
  );
}
