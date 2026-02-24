"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-14 h-14 rounded-full bg-crimson-900/30 border border-crimson-800/40 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-crimson-400" />
      </div>
      <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-text-muted mb-6">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary flex items-center gap-2"
      >
        Try again
      </button>
    </div>
  );
}
