import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-px flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">404</p>
      <h1 className="mt-5 font-headline text-5xl font-extrabold uppercase tracking-tighter">
        Page not found
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page you are looking for doesn&apos;t exist — or has been moved. Let&apos;s get you back
        to the collection.
      </p>
      <Link href="/" className="btn-primary mt-9">
        Back to home
      </Link>
    </div>
  );
}