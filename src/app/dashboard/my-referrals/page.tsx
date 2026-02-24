"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, MessageSquare, DollarSign, Clock, Briefcase, Star } from "lucide-react";
import { getMyReferrals } from "@/lib/actions/referrals";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ReviewModal } from "@/components/ReviewModal";
import { feeDisplay, formatRelativeTime } from "@/lib/utils";
import type { ReferralWithDetails, ReferralStatus } from "@/types";

export default function MyReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReferralStatus | "all">("all");
  const [reviewModal, setReviewModal] = useState<{ referralId: string; revieweeName: string } | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getMyReferrals("referrer");
      setReferrals(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    filter === "all"
      ? referrals
      : referrals.filter((r) => r.status === filter);

  const statusCounts = referrals.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-navy-800 rounded w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
          My Referrals
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Track the referrals you&apos;ve submitted
        </p>
      </div>

      {referrals.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No referrals yet"
          description="Browse available offers and submit your first referral to start earning"
          actionLabel="Browse Offers"
          actionHref="/dashboard/offers"
        />
      ) : (
        <>
          {/* Status Filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {(
              ["all", "submitted", "accepted", "completed", "rejected", "expired"] as const
            ).map((status) => {
              const count =
                status === "all"
                  ? referrals.length
                  : statusCounts[status] || 0;
              if (status !== "all" && count === 0) return null;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    filter === status
                      ? "bg-crimson-600/20 text-crimson-400 border border-crimson-700/30"
                      : "text-text-muted bg-navy-800/50 border border-border-subtle hover:text-text-secondary"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                  ({count})
                </button>
              );
            })}
          </div>

          {/* Referral List */}
          <div className="space-y-3">
            {filtered.map((referral, i) => (
              <div
                key={referral.id}
                className="bg-surface rounded-xl border border-border p-5 animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={referral.status} />
                    </div>
                    <p className="text-base font-semibold text-text-primary font-[family-name:var(--font-display)]">
                      {referral.lead_name}
                    </p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} className="text-navy-400" />
                        {referral.offer?.title} &middot; {referral.business?.name}
                      </span>
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} className="text-forest-400" />
                        {feeDisplay(
                          referral.fee_type,
                          referral.flat_fee_amount,
                          referral.percentage_fee
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(referral.submitted_at)}
                      </span>
                      {referral.referrer_payout && (
                        <span className="text-forest-400 font-medium">
                          Earned: ${referral.referrer_payout.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {referral.status === "completed" &&
                      referral.referrer_rating_of_business == null && (
                        <button
                          onClick={() =>
                            setReviewModal({
                              referralId: referral.id,
                              revieweeName: referral.business?.name ?? "this business",
                            })
                          }
                          className="btn-secondary text-xs flex items-center gap-1.5 py-2"
                        >
                          <Star size={13} /> Leave Review
                        </button>
                      )}
                    {referral.status === "completed" &&
                      referral.referrer_rating_of_business != null && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Star size={13} className="text-warning fill-warning" />
                          Reviewed
                        </span>
                      )}
                    <Link
                      href={`/dashboard/messages?referral=${referral.id}`}
                      className="btn-ghost text-xs flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} /> Message
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          referralId={reviewModal.referralId}
          role="referrer"
          revieweeName={reviewModal.revieweeName}
          onClose={() => setReviewModal(null)}
          onSubmitted={() => {
            setReferrals((prev) =>
              prev.map((r) =>
                r.id === reviewModal.referralId
                  ? { ...r, referrer_rating_of_business: -1 }
                  : r
              )
            );
            setReviewModal(null);
          }}
        />
      )}
    </div>
  );
}
