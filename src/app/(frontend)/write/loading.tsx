/**
 * Loading placeholder for the /write editor (<WritePage>). Mirrors its shell:
 * fixed full-screen surface, the cancel/delete header, the tall editor area,
 * and the fixed word-count + submit footer.
 */
export default function WriteLoading() {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto pt-6 sm:pt-8 pb-28 sm:pb-32 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header: cancel (left) / delete (right) */}
        <header className="flex items-center justify-between py-4 border-b border-border/40">
          <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted/50 rounded animate-pulse" />
        </header>

        {/* Editor area */}
        <div className="pt-4">
          <div className="w-full min-h-[60vh] space-y-3.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-full bg-muted/30 rounded animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
            <div className="h-7 w-2/3 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>

        {/* Footer: word count + submit */}
        <footer className="fixed bottom-0 left-0 w-full p-3 sm:p-4 md:p-6 flex justify-center pointer-events-none">
          <div className="max-w-3xl w-full flex items-center justify-between bg-background/80 backdrop-blur-md border border-border/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl pointer-events-auto shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
            <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
            <div className="h-10 w-36 bg-indigo-600/30 rounded-lg sm:rounded-xl animate-pulse" />
          </div>
        </footer>
      </div>
    </div>
  );
}
