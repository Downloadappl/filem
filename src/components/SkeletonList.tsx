import React from "react";

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden glass-panel border border-white/5 flex flex-col p-3 gap-3 relative justify-end">
      <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
        <div className="w-full h-full shimmer" />
      </div>
      <div className="h-4 w-1/3 rounded bg-neutral-800 relative z-10 overflow-hidden">
        <div className="w-full h-full shimmer" />
      </div>
      <div className="h-6 w-3/4 rounded bg-neutral-850 relative z-10 overflow-hidden">
        <div className="w-full h-full shimmer" />
      </div>
      <div className="h-3 w-1/2 rounded bg-neutral-850 relative z-10 overflow-hidden">
        <div className="w-full h-full shimmer" />
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number; gridCols?: string }> = ({ 
  count = 6, 
  gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" 
}) => {
  const arr = Array.from({ length: count });
  return (
    <div className={`grid gap-4 sm:gap-6 ${gridCols}`}>
      {arr.map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[65vh] min-h-[480px] bg-neutral-950 relative flex items-end p-8 sm:p-12 md:p-16">
      <div className="absolute inset-0 w-full h-full shimmer" />
      <div className="relative w-full max-w-3xl space-y-4 z-10">
        <div className="h-4 w-24 bg-neutral-850 rounded" />
        <div className="h-12 w-3/4 bg-neutral-800 rounded" />
        <div className="h-4 w-5/6 bg-neutral-850 rounded" />
        <div className="h-4 w-2/3 bg-neutral-850 rounded" />
        <div className="flex gap-3 pt-4">
          <div className="h-12 w-32 bg-neutral-800 rounded-lg" />
          <div className="h-12 w-32 bg-neutral-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white space-y-8 animate-pulse">
      {/* Backdrop area placeholder */}
      <div className="w-full h-[50vh] min-h-[350px] bg-neutral-900 relative">
        <div className="w-full h-full shimmer" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Poster placeholder */}
          <div className="col-span-1 aspect-[2/3] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="w-full h-full shimmer" />
          </div>

          {/* Texts placeholder */}
          <div className="col-span-1 md:col-span-3 space-y-5 pt-32 md:pt-36">
            <div className="h-10 w-2/3 bg-neutral-850 rounded" />
            <div className="h-4 w-1/3 bg-neutral-850 rounded" />
            <div className="flex gap-2">
              <span className="h-6 w-16 bg-neutral-800 rounded" />
              <span className="h-6 w-16 bg-neutral-800 rounded" />
              <span className="h-6 w-16 bg-neutral-800 rounded" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-4 w-full bg-neutral-850 rounded" />
              <div className="h-4 w-full bg-neutral-850 rounded" />
              <div className="h-4 w-3/4 bg-neutral-850 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
