/**
 * ServicesPage Loading Skeleton
 * Matches: PageHeader → SubCategoryGrid (6-col with price overlay)
 */
export default function LayananLoading() {
  return (
    <div className="pt-20 min-h-screen bg-background overflow-x-hidden">
      {/* PAGE HEADER SKELETON */}
      <section className="container mx-auto px-6 max-w-7xl pt-16 pb-6 border-b border-border/60 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/5 animate-pulse" />
            <div className="h-2 w-28 rounded-full bg-primary/5 animate-pulse" />
          </div>
          <div className="h-10 w-52 rounded-xl bg-primary/5 animate-pulse" />
        </div>
        <div className="h-6 w-44 rounded-full bg-primary/5 animate-pulse" />
      </section>

      {/* PRODUCT GRID SKELETON */}
      <section className="container mx-auto px-6 max-w-7xl pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-card border border-border/60 shadow-sm animate-pulse">
                {/* Price overlay skeleton */}
                <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
                  <div className="h-1.5 w-20 rounded-full bg-white/10" />
                  <div className="h-3 w-24 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="px-2 space-y-2">
                <div className="h-3 w-full rounded-full bg-primary/5 animate-pulse" />
                <div className="h-2 w-20 rounded-full bg-primary/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
