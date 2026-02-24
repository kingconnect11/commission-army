"use client";

import { Users, Building2, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLES: { value: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "referrer",
    label: "I want to refer leads",
    description: "Find offers, submit leads, and earn when they convert",
    icon: Users,
  },
  {
    value: "business",
    label: "I want to receive leads",
    description: "Post offers and pay referrers for qualified leads",
    icon: Building2,
  },
  {
    value: "both",
    label: "Both",
    description: "Refer leads and receive leads for your own business",
    icon: ArrowRightLeft,
  },
];

interface RoleSelectProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
}

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ROLES.map(({ value: roleValue, label, description, icon: Icon }) => (
        <div
          key={roleValue}
          role="button"
          tabIndex={0}
          className={cn(
            "bg-surface rounded-xl border p-5 cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500",
            value === roleValue
              ? "border-crimson-600/60 bg-crimson-600/5 shadow-sm shadow-crimson-900/20"
              : "border-border hover:border-border hover:bg-surface-raised"
          )}
          onClick={() => onChange(roleValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange(roleValue);
            }
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-800 mb-3">
            <Icon size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)] mb-1">{label}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      ))}
    </div>
  );
}
