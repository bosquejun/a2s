import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-8 animate-fade-in">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-600">
            After 2AM
          </p>
          <h1 className="font-serif italic text-4xl md:text-5xl text-slate-100">
            This whisper got lost.
          </h1>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed">
          The story you were reaching for isn&apos;t here anymore. Maybe it was
          only meant to be read once. You can always go back and find a new one.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-800 bg-slate-900/50 text-[11px] uppercase tracking-[0.3em] text-slate-200 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all"
          >
            Back to stories
          </Link>
          <Link
            href="/write"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-900 bg-indigo-600/90 text-[11px] uppercase tracking-[0.3em] text-slate-50 hover:bg-indigo-500 transition-all"
          >
            Whisper your own
          </Link>
        </div>
      </div>

      <div className="fixed top-[-15%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-slate-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
