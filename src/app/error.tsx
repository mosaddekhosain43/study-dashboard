"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-line bg-card p-6 sm:p-8 text-center shadow-lg">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-ink">Something went wrong</h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          The requested page could not be loaded. If you are offline, you can continue studying from the main dashboard.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-leaf/90 transition"
          >
            <RotateCcw className="size-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink hover:bg-line/50 transition"
          >
            <Home className="size-3.5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
