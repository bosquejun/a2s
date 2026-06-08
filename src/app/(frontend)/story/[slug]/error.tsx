"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function StoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Story page error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-8 pb-32 px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full space-y-6">
          <Alert
            variant="destructive"
            className="bg-rose-500/10 border-rose-500/40 text-rose-400 [&_svg]:text-rose-400"
          >
            <AlertCircle className="size-4" />
            <AlertTitle className="text-rose-300">
              Story not available
            </AlertTitle>
            <AlertDescription className="text-rose-400/90">
              <p>
                We couldn&apos;t load this story. It might have been removed or
                there was an error loading it.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-slate-900/50 hover:bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Home className="size-4" />
              <span>Go home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

