import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "default" | "crimson" | "forest" | "navy";
  className?: string;
}

const accentMap = {
  default: {
    iconBg: "bg-navy-800",
    iconColor: "text-navy-300",
    border: "border-navy-700/50",
  },
  crimson: {
    iconBg: "bg-crimson-900/40",
    iconColor: "text-crimson-400",
    border: "border-crimson-800/30",
  },
  forest: {
    iconBg: "bg-forest-900/40",
    iconColor: "text-forest-400",
    border: "border-forest-800/30",
  },
  navy: {
    iconBg: "bg-navy-700/50",
    iconColor: "text-navy-300",
    border: "border-navy-600/30",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "default",
  className,
}: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border p-5 transition-all duration-200 hover:bg-surface-raised",
        colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-text-muted mt-1.5">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            colors.iconBg
          )}
        >
          <Icon size={18} className={colors.iconColor} />
        </div>
      </div>
    </div>
  );
}
