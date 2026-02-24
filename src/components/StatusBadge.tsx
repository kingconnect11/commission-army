import { cn } from "@/lib/utils";
import { REFERRAL_STATUS_LABELS } from "@/config/constants";
import type { ReferralStatus } from "@/types";

interface StatusBadgeProps {
  status: ReferralStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("badge", `badge-${status}`, className)}>
      {REFERRAL_STATUS_LABELS[status]}
    </span>
  );
}
