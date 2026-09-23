/**
 * HomePage Loading Skeleton
 * Matches: Hero → Stats → CategoryPreview → VisionSection → RecentWorks → CommitmentSection
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col bg-background overflow-x-hidden">
      <main className="flex-1">
        {/* HERO SKELETON */}
        <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center bg-background">
          <div className="absolute inset-0 z-0 bg-card animate-pulse" />
          <div className="relative z-10 container px-6 pt-32 pb-24 text-center space-y-10 max-w-5xl mx-auto flex flex-col items-center">
            <div className="w-48 h-6 rounded-full bg-white/5 animate-pulse" />
            <div className="space-y-4 max-w-3xl">
              <div className="h-12 w-full max-w-lg mx-auto rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-12 w-3/4 mx-auto rounded-2xl bg-white/5 animate-pulse" />
            </div>
            <div className="w-72 h-4 rounded-full bg-white/5 animate-pulse" />
            <div className="flex gap-4 pt-6">
              <div className="h-14 w-48 rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-14 w-48 rounded-2xl bg-white/5 animate-pulse" />
            </div>
          </div>
        </section>

        {/* STATS SKELETON */}
        <section className="py-10 border-y border-border/60 bg-card">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-2 w-20 mx-auto rounded-full bg-primary/5 animate-pulse" />
                  <div className="h-7 w-16 mx-auto rounded-lg bg-primary/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY PREVIEW SKELETON */}
        <section className="py-16 md:py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="space-y-2">
                <div className="h-2 w-24 rounded-full bg-primary/5 animate-pulse" />
                <div className="h-8 w-48 rounded-xl bg-primary/5 animate-pulse" />
              </div>
              <div className="h-4 w-24 rounded-full bg-primary/5 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-[1.8rem] bg-primary/[0.02] animate-pulse" />
              ))}
            </div>
          </div>
        </section>

        {/* RECENT WORKS SKELETON */}
        <section className="py-16 md:py-20 px-6 bg-card">
          <div className="container mx-auto max-w-7xl">
            <div className="space-y-2 mb-8">
              <div className="h-2 w-28 rounded-full bg-primary/5 animate-pulse" />
              <div className="h-8 w-56 rounded-xl bg-primary/5 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-[3/4] rounded-[1.8rem] bg-primary/[0.02] animate-pulse" />
                  <div className="px-1 space-y-2">
                    <div className="h-3 w-3/4 rounded-full bg-primary/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMITMENT SKELETON */}
        <section className="py-16 md:py-20 px-6 bg-primary/[0.01] border-t border-border/60">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center space-y-2 mb-12">
              <div className="h-2 w-28 mx-auto rounded-full bg-primary/5 animate-pulse" />
              <div className="h-8 w-64 mx-auto rounded-xl bg-primary/5 animate-pulse" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-none bg-card rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-3 w-24 rounded-full bg-primary/5 animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-primary/5 animate-pulse" />
                    <div className="h-2 w-3/4 rounded-full bg-primary/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
