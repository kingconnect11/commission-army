import {
  Send,
  Clock,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Star,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { getProfile } from "@/lib/actions/auth";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const profile = await getProfile();
  const stats = await getDashboardStats();
  const role = profile?.role;
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary font-[family-name:var(--font-display)]">
          Welcome back, {firstName}
        </h1>
        <p className="text-text-muted mt-1">
          Here&apos;s what&apos;s happening with your {role === "business" ? "referrals" : "commissions"}.
        </p>
      </div>

      {/* Referrer Stats */}
      {(role === "referrer" || role === "both") && (
        <div className="mb-8">
          {role === "both" && (
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 font-[family-name:var(--font-display)]">
              Referral Activity
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="animate-fade-in stagger-1 opacity-0">
              <StatCard
                label="Total Sent"
                value={stats.totalReferralsSent ?? 0}
                icon={Send}
                accent="navy"
              />
            </div>
            <div className="animate-fade-in stagger-2 opacity-0">
              <StatCard
                label="Pending"
                value={stats.pendingReferrals ?? 0}
                icon={Clock}
                accent="default"
              />
            </div>
            <div className="animate-fade-in stagger-3 opacity-0">
              <StatCard
                label="Accepted"
                value={stats.acceptedReferrals ?? 0}
                icon={CheckCircle2}
                accent="forest"
              />
            </div>
            <div className="animate-fade-in stagger-4 opacity-0">
              <StatCard
                label="Total Earned"
                value={formatCurrency(stats.totalEarned ?? 0)}
                icon={DollarSign}
                accent="crimson"
              />
            </div>
            <div className="animate-fade-in stagger-5 opacity-0">
              <StatCard
                label="Pending Earnings"
                value={formatCurrency(stats.pendingEarnings ?? 0)}
                icon={TrendingUp}
                accent="default"
              />
            </div>
            <div className="animate-fade-in stagger-6 opacity-0">
              <StatCard
                label="Completed"
                value={stats.completedReferrals ?? 0}
                icon={CheckCircle2}
                accent="forest"
              />
            </div>
          </div>
        </div>
      )}

      {/* Business Stats */}
      {(role === "business" || role === "both") && (
        <div className="mb-8">
          {role === "both" && (
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 font-[family-name:var(--font-display)]">
              Business Activity
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="animate-fade-in stagger-1 opacity-0">
              <StatCard
                label="Referrals Received"
                value={stats.totalReferralsReceived ?? 0}
                icon={Inbox}
                accent="navy"
              />
            </div>
            <div className="animate-fade-in stagger-2 opacity-0">
              <StatCard
                label="Active Offers"
                value={stats.activeOffers ?? 0}
                icon={Briefcase}
                accent="default"
              />
            </div>
            <div className="animate-fade-in stagger-3 opacity-0">
              <StatCard
                label="Total Spent"
                value={formatCurrency(stats.totalSpent ?? 0)}
                icon={DollarSign}
                accent="crimson"
              />
            </div>
            <div className="animate-fade-in stagger-4 opacity-0">
              <StatCard
                label="Your Rating"
                value={
                  stats.averageRating
                    ? `${stats.averageRating.toFixed(1)} / 5`
                    : "No ratings"
                }
                icon={Star}
                accent="forest"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fade-in stagger-6 opacity-0">
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 font-[family-name:var(--font-display)]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(role === "referrer" || role === "both") && (
              <a
                href="/dashboard/offers"
                className="flex items-center gap-3 p-4 rounded-lg bg-navy-800/50 border border-border-subtle card-hover"
              >
                <div className="w-9 h-9 rounded-lg bg-crimson-900/40 flex items-center justify-center">
                  <Send size={16} className="text-crimson-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Browse Offers
                  </p>
                  <p className="text-xs text-text-muted">
                    Find referral opportunities
                  </p>
                </div>
              </a>
            )}
            {(role === "business" || role === "both") && (
              <>
                <a
                  href="/dashboard/offers/new"
                  className="flex items-center gap-3 p-4 rounded-lg bg-navy-800/50 border border-border-subtle card-hover"
                >
                  <div className="w-9 h-9 rounded-lg bg-forest-900/40 flex items-center justify-center">
                    <Briefcase size={16} className="text-forest-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Create Offer
                    </p>
                    <p className="text-xs text-text-muted">
                      Post a referral opportunity
                    </p>
                  </div>
                </a>
                <a
                  href="/dashboard/incoming"
                  className="flex items-center gap-3 p-4 rounded-lg bg-navy-800/50 border border-border-subtle card-hover"
                >
                  <div className="w-9 h-9 rounded-lg bg-navy-700/50 flex items-center justify-center">
                    <Inbox size={16} className="text-navy-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      View Incoming
                    </p>
                    <p className="text-xs text-text-muted">
                      Review submitted referrals
                    </p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
