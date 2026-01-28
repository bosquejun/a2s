export function StoryReaderSkeleton() {
  return (
    <div className="flex flex-col w-full h-screen max-h-screen relative overflow-hidden bg-slate-950 animate-fade-in">
      {/* Progress bar skeleton */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-slate-900/50">
        <div className="h-full bg-slate-800/50 w-0" />
      </div>

      {/* Main content skeleton */}
      <div className="grow w-full overflow-y-auto overflow-x-hidden pt-24 sm:pt-32 pb-40 md:pb-48 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Header skeleton */}
          <div className="mb-12 flex flex-col items-center text-center space-y-8 w-full">
            {/* Category/Read time skeleton */}
            <div className="flex items-center space-x-6">
              <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-4 w-px bg-slate-800" />
              <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-3 w-full">
              <div className="h-12 sm:h-16 md:h-20 w-full max-w-2xl mx-auto bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="h-12 sm:h-16 md:h-20 w-3/4 max-w-xl mx-auto bg-slate-800/40 rounded-lg animate-pulse" />
            </div>

            {/* Divider skeleton */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="h-px w-12 bg-slate-800" />
              <div className="h-3 w-24 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-px w-12 bg-slate-800" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="w-full space-y-4 pb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-6 sm:h-7 md:h-8 w-full bg-slate-800/40 rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <div className="h-6 sm:h-7 md:h-8 w-4/5 bg-slate-800/30 rounded animate-pulse" />
          </div>

          {/* Author skeleton */}
          <div className="mt-16 flex flex-col items-center space-y-3 opacity-40 pb-20">
            <div className="h-px w-8 bg-slate-800 mb-2" />
            <div className="h-3 w-20 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-800/40 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom controls skeleton */}
      <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 md:p-10 pointer-events-none z-50">
        <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pointer-events-auto">
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-full bg-slate-800/50 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <div className="h-12 w-full sm:w-40 rounded-full bg-indigo-600/30 animate-pulse" />
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="fixed bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-40" />
    </div>
  );
}

