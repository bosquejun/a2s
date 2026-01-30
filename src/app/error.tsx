"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error);
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
              Something went wrong
            </AlertTitle>
            <AlertDescription className="text-rose-400/90">
              <p className="mb-4">
                We encountered an unexpected error. It&apos;s not your fault.
              </p>
              {process.env.NODE_ENV === "development" && error.message && (
                <details className="mt-4 text-xs font-mono bg-slate-900/50 p-3 rounded border border-rose-500/20">
                  <summary className="cursor-pointer text-rose-300 mb-2">
                    Error details
                  </summary>
                  <pre className="whitespace-pre-wrap break-words text-rose-400/80">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
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

