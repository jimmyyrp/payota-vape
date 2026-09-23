/**
 * KaryaPage Loading Skeleton
 * Matches: Header → StickyFilterBar → GalleryGrid (6-col masonry)
 */
export default function KaryaLoading() {
  return (
    <div className="pt-20 min-h-screen bg-background overflow-x-hidden">
      {/* HEADER SKELETON */}
      <section className="px-6 pt-16 pb-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-2">
            <div className="h-2 w-24 rounded-full bg-primary/5 animate-pulse" />
            <div className="h-10 w-56 rounded-xl bg-primary/5 animate-pulse" />
          </div>
        </div>
      </section>

      {/* FILTER BAR SKELETON */}
      <section className="py-3 px-6 bg-white/95 border-y border-border/60">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-3 items-center">
            <div className="flex-1 h-11 rounded-xl bg-primary/[0.03] animate-pulse" />
            <div className="h-11 w-36 rounded-xl bg-primary/[0.03] animate-pulse" />
            <div className="h-11 w-28 rounded-xl bg-primary/[0.03] animate-pulse" />
          </div>
        </div>
      </section>

      {/* GALLERY GRID SKELETON */}
      <section className="px-6 pt-10 pb-24 min-h-[60vh]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3.5">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2.2rem] bg-primary/[0.02] animate-pulse" />
                <div className="px-1.5 space-y-2">
                  <div className="h-3 w-full rounded-full bg-primary/5 animate-pulse" />
                  <div className="h-2 w-2/3 rounded-full bg-primary/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
