"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Send,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import {
  getPlatformMetrics,
  getRecentReferrals,
} from "@/lib/actions/admin";
import {
  getUnresolvedFraudSignals,
  resolveFraudSignal,
} from "@/lib/actions/fraud";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { PlatformMetrics } from "@/lib/actions/admin";

// Infer types from return values
type RecentReferral = Awaited<ReturnType<typeof getRecentReferrals>>[number];
type FraudSignal = Awaited<ReturnType<typeof getUnresolvedFraudSignals>>[number];

function StatCard({
  title,
  value,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
        <Icon
          size={16}
          className={accent ? "text-crimson-400" : "text-text-muted"}
        />
      </div>
      <div
        className={`text-2xl font-semibold font-[family-name:var(--font-display)] ${
          accent ? "text-crimson-400" : "text-text-primary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-crimson-900/20 text-crimson-400 border-crimson-800/30",
  medium: "bg-yellow-900/20 text-yellow-400 border-yellow-800/30",
  low: "bg-navy-800/50 text-text-secondary border-border-subtle",
};

export default function AdminPage() {
  const toast = useToast();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [referrals, setReferrals] = useState<RecentReferral[]>([]);
  const [fraudSignals, setFraudSignals] = useState<FraudSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [m, r, f] = await Promise.all([
        getPlatformMetrics(),
        getRecentReferrals(20),
        getUnresolvedFraudSignals(50),
      ]);
      setMetrics(m);
      setReferrals(r as RecentReferral[]);
      setFraudSignals(f as FraudSignal[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleResolve(signalId: string) {
    setResolvingId(signalId);
    const result = await resolveFraudSignal(signalId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setFraudSignals((prev) => prev.filter((s) => s.id !== signalId));
      toast.success("Signal resolved");
    }
    setResolvingId(null);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-navy-800 rounded w-1/4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-5 h-24" />
          ))}
        </div>
        <div className="bg-surface rounded-xl border border-border h-64" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-6xl mx-auto">
        <EmptyState
          icon={ShieldOff}
          title="Access Denied"
          description="You don't have permission to view the admin dashboard."
        />
      </div>
    );
  }

  const totalByStatus = metrics.referralsByStatus;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-crimson-600/15 border border-crimson-700/30 flex items-center justify-center">
          <ShieldCheck size={18} className="text-crimson-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Platform-wide metrics and oversight</p>
        </div>
      </div>

      {/* Platform Metrics */}
      <section>
        <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          Platform Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={metrics.totalUsers} icon={Users} />
          <StatCard title="Businesses" value={metrics.totalBusinesses} icon={Briefcase} />
          <StatCard title="Total Referrals" value={metrics.totalReferrals} icon={Send} />
          <StatCard
            title="Platform Revenue"
            value={`$${metrics.platformRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            accent
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <StatCard
            title="Transaction Volume"
            value={`$${metrics.totalTransactionVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
          />
          <StatCard title="Active Offers" value={metrics.totalOffers} icon={Briefcase} />
          <StatCard
            title="Fraud Signals"
            value={metrics.unresolvedFraudSignals}
            icon={AlertTriangle}
            accent={metrics.unresolvedFraudSignals > 0}
          />
          {/* Referral status breakdown */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Referral Status
            </p>
            <div className="space-y-1.5">
              {Object.entries(totalByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted capitalize">{status}</span>
                  <span className="font-medium text-text-secondary">{count}</span>
                </div>
              ))}
              {Object.keys(totalByStatus).length === 0 && (
                <p className="text-xs text-text-muted">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fraud Signals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Unresolved Fraud Signals
            {fraudSignals.length > 0 && (
              <span className="ml-2 text-crimson-400">({fraudSignals.length})</span>
            )}
          </h2>
        </div>

        {fraudSignals.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-6 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-forest-400 shrink-0" />
            <p className="text-sm text-text-secondary">No unresolved fraud signals — all clear.</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Referral
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {fraudSignals.map((signal) => (
                    <tr key={signal.id} className="hover:bg-navy-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-text-primary font-medium capitalize">
                          {signal.signal_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                            SEVERITY_STYLES[signal.severity] ?? SEVERITY_STYLES.low
                          }`}
                        >
                          {signal.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {(signal.user as { full_name?: string; email?: string } | null)
                          ?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {(signal.referral as { lead_name?: string } | null)?.lead_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {formatRelativeTime(signal.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleResolve(signal.id)}
                          disabled={resolvingId === signal.id}
                          className="btn-ghost text-xs flex items-center gap-1.5 text-forest-400 hover:text-forest-300 ml-auto"
                        >
                          {resolvingId === signal.id ? (
                            <div className="w-3 h-3 border border-forest-400/30 border-t-forest-400 rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Recent Referrals */}
      <section>
        <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          Recent Referrals (Last 20)
        </h2>

        {referrals.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-6">
            <p className="text-sm text-text-muted">No referrals yet.</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Business
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {referrals.map((r) => {
                    const referrer = r.referrer as { full_name?: string } | null;
                    const business = r.business as { name?: string } | null;
                    const offer = r.offer as { title?: string } | null;
                    return (
                      <tr key={r.id} className="hover:bg-navy-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {r.lead_name}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {referrer?.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {business?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-text-secondary max-w-[180px] truncate">
                          {offer?.title ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {r.flat_fee_amount != null
                            ? `$${Number(r.flat_fee_amount).toLocaleString()}`
                            : r.percentage_fee != null
                            ? `${r.percentage_fee}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatRelativeTime(r.submitted_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
