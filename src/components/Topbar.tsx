"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  userName: string;
  avatarUrl: string | null;
  onMenuClick: () => void;
}

export function Topbar({ userName, avatarUrl, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-lg border-b border-border-subtle">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-2 rounded-lg"
        >
          <Menu size={20} className="text-text-secondary" />
        </button>

        {/* Page area - empty for now, pages can use their own headers */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="flex items-center gap-2.5 pl-2 ml-2 border-l border-border-subtle">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-navy-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center ring-2 ring-navy-600">
                <span className="text-xs font-semibold text-navy-200">
                  {getInitials(userName)}
                </span>
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-text-primary truncate max-w-[120px]">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
