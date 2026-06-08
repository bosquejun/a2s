export default function WriteLoading() {
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-8 pb-32 px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header skeleton */}
        <header className="flex items-center justify-between py-4 border-b border-slate-900">
          <div className="h-6 w-20 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-6 w-6 bg-slate-800/50 rounded animate-pulse" />
        </header>

        {/* Prompt skeleton */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-32 bg-slate-800/50 rounded animate-pulse" />
        </div>

        {/* Textarea skeleton */}
        <div className="pt-4">
          <div className="w-full min-h-[60vh] space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-full bg-slate-800/30 rounded animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-center pointer-events-none">
          <div className="max-w-3xl w-full flex items-center justify-between bg-slate-950/80 backdrop-blur-md border border-slate-900 p-2 rounded-2xl pointer-events-auto">
            <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-10 w-32 bg-indigo-600/30 rounded-xl animate-pulse" />
          </div>
        </footer>
      </div>
    </div>
  );
}
