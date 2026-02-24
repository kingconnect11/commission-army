import type { DashboardStats } from "@/lib/actions/dashboard";
import type { UserRole } from "@/types";
import {
  Send,
  Clock,
  CheckCircle,
  DollarSign,
  Inbox,
  Store,
  TrendingDown,
  Star,
} from "lucide-react";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  role: UserRole;
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
        <Icon size={16} className="text-text-muted" />
      </div>
      <div className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-display)]">{value}</div>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function DashboardStatsCards({ stats, role }: DashboardStatsCardsProps) {
  const showReferrer = role === "referrer" || role === "both";
  const showBusiness = role === "business" || role === "both";

  return (
    <div className="space-y-6">
      {showReferrer && (
        <div>
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Referrer stats</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Total referrals sent" value={stats.totalReferralsSent ?? 0} icon={Send} />
            <StatCard title="Pending" value={stats.pendingReferrals ?? 0} icon={Clock} />
            <StatCard title="Accepted" value={stats.acceptedReferrals ?? 0} icon={CheckCircle} />
            <StatCard title="Total earned" value={formatCurrency(stats.totalEarned ?? 0)} icon={DollarSign} />
            <StatCard title="Pending earnings" value={formatCurrency(stats.pendingEarnings ?? 0)} icon={Clock} subtitle="Awaiting release" />
          </div>
        </div>
      )}

      {showBusiness && (
        <div>
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Business stats</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Referrals received" value={stats.totalReferralsReceived ?? 0} icon={Inbox} />
            <StatCard title="Active offers" value={stats.activeOffers ?? 0} icon={Store} />
            <StatCard title="Total spent" value={formatCurrency(stats.totalSpent ?? 0)} icon={TrendingDown} />
            <StatCard title="Average rating" value={stats.averageRating != null ? stats.averageRating.toFixed(1) : "—"} icon={Star} subtitle="From referrers" />
          </div>
        </div>
      )}

      {!showReferrer && !showBusiness && (
        <p className="text-sm text-text-muted">Complete onboarding to see your stats.</p>
      )}
    </div>
  );
}
