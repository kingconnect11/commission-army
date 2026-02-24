"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Send,
  BarChart3,
  PlusCircle,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Inbox,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import type { UserRole } from "@/types";

interface SidebarProps {
  role: UserRole | null;
  userName: string;
  isAdmin?: boolean;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const referrerNav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/offers", label: "Browse Offers", icon: Search },
  { href: "/dashboard/my-referrals", label: "My Referrals", icon: Send },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const businessNav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/my-offers", label: "My Offers", icon: Briefcase },
  { href: "/dashboard/incoming", label: "Incoming Referrals", icon: Inbox },
  { href: "/dashboard/offers/new", label: "Create Offer", icon: PlusCircle },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const bothNav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/offers", label: "Browse Offers", icon: Search },
  { href: "/dashboard/my-offers", label: "My Offers", icon: Briefcase },
  { href: "/dashboard/offers/new", label: "Create Offer", icon: PlusCircle },
  { href: "/dashboard/my-referrals", label: "My Referrals", icon: Send },
  { href: "/dashboard/incoming", label: "Incoming Referrals", icon: Inbox },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getNavItems(role: UserRole | null) {
  if (role === "both") return bothNav;
  if (role === "business") return businessNav;
  return referrerNav;
}

export function Sidebar({
  role,
  userName,
  isAdmin = false,
  collapsed: initialCollapsed = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const navItems = [
    ...getNavItems(role),
    ...(isAdmin ? [{ href: "/dashboard/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-border-subtle">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center shadow-lg shadow-crimson-900/40">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-display)]">
                CA
              </span>
            </div>
            <span className="text-text-primary font-semibold text-sm font-[family-name:var(--font-display)] tracking-wide">
              COMMISSION ARMY
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center shadow-lg shadow-crimson-900/40">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-display)]">
                CA
              </span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex btn-ghost p-1.5 rounded-md"
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden btn-ghost p-1.5 rounded-md"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-crimson-600/15 text-crimson-400 border border-crimson-700/30"
                  : "text-text-secondary hover:bg-navy-800 hover:text-text-primary border border-transparent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0",
                  active ? "text-crimson-400" : "text-text-muted"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Sign Out */}
      <div className="px-3 py-4 border-t border-border-subtle">
        {!collapsed && (
          <div className="px-3 mb-3">
            <p className="text-xs text-text-muted truncate">{userName}</p>
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-navy-800 hover:text-crimson-400 transition-all duration-150",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-surface border-r border-border-subtle h-screen sticky top-0 transition-all duration-200",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-surface border-r border-border-subtle animate-slide-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
