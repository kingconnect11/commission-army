"use client";

// Simple passthrough providers wrapper.
// The project uses a custom Toast system (Toast.tsx + ToastProvider in DashboardShell).
// This file exists as a placeholder for any future global providers (analytics, etc.).
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
