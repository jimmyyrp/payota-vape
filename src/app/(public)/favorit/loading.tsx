/**
 * FavoritesPage Loading Skeleton
 * Matches: PageHeader → BookmarkGrid (6-col)
 */
export default function FavoritLoading() {
  return (
    <div className="pt-20 min-h-screen bg-background flex flex-col overflow-x-hidden">
      <section className="container mx-auto px-6 max-w-7xl flex-1 pb-24">
        {/* HEADER SKELETON */}
        <div className="pt-16 pb-4 border-b border-border/60 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="h-2 w-28 rounded-full bg-primary/5 animate-pulse" />
            <div className="h-10 w-48 rounded-xl bg-primary/5 animate-pulse" />
          </div>
          <div className="h-6 w-48 rounded-full bg-primary/5 animate-pulse" />
        </div>

        {/* GRID SKELETON */}
        <div className="min-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3.5">
                <div className="relative aspect-[3/4] rounded-[2.2rem] overflow-hidden bg-primary/[0.02] animate-pulse" />
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
