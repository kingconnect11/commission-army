"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastProvider } from "./Toast";
import type { UserRole } from "@/types";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole | null;
  userName: string;
  avatarUrl: string | null;
  isAdmin?: boolean;
}

export function DashboardShell({
  children,
  role,
  userName,
  avatarUrl,
  isAdmin = false,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar
          role={role}
          userName={userName}
          isAdmin={isAdmin}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            userName={userName}
            avatarUrl={avatarUrl}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
