"use client";

import { useState, useEffect } from "react";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  DollarSign,
  User,
  Star,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  getMyReferrals,
  updateReferralStatus,
  reportDealClosure,
} from "@/lib/actions/referrals";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ReviewModal } from "@/components/ReviewModal";
import { useToast } from "@/components/Toast";
import { feeDisplay, formatRelativeTime, cn } from "@/lib/utils";
import type { ReferralWithDetails, ReferralStatus } from "@/types";

export default function IncomingReferralsPage() {
  const toast = useToast();
  const [referrals, setReferrals] = useState<ReferralWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReferralStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [closureId, setClosureId] = useState<string | null>(null);
  const [dealValue, setDealValue] = useState("");
  const [error, setError] = useState("");
  const [reviewModal, setReviewModal] = useState<{ referralId: string; revieweeName: string } | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getMyReferrals("business");
      setReferrals(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleAccept(id: string) {
    setActionLoading(id);
    setError("");
    const result = await updateReferralStatus(id, "accepted");
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setReferrals((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "accepted" as const } : r))
      );
      toast.success("Referral accepted");
    }
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    setError("");
    const result = await updateReferralStatus(id, "rejected");
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setReferrals((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
      );
      toast.success("Referral rejected");
    }
    setActionLoading(null);
  }

  async function handleCloseDeal(id: string) {
    if (!dealValue || parseFloat(dealValue) <= 0) {
      setError("Please enter a valid deal value");
      toast.error("Please enter a valid deal value");
      return;
    }
    setActionLoading(id);
    setError("");
    const result = await reportDealClosure(id, parseFloat(dealValue));
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "completed" as const, deal_value: parseFloat(dealValue) }
            : r
        )
      );
      toast.success("Deal marked complete");
      setClosureId(null);
      setDealValue("");
    }
    setActionLoading(null);
  }

  const filtered =
    filter === "all"
      ? referrals
      : referrals.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-navy-800 rounded w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
          Incoming Referrals
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Review and manage referrals submitted to your business
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-4">
          <AlertCircle size={16} className="text-crimson-400 shrink-0 mt-0.5" />
          <p className="text-sm text-crimson-300">{error}</p>
        </div>
      )}

      {referrals.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No referrals yet"
          description="When people submit referrals to your offers, they'll appear here"
          actionLabel="Create an Offer"
          actionHref="/dashboard/offers/new"
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {(
              ["all", "submitted", "accepted", "completed", "rejected"] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  filter === status
                    ? "bg-crimson-600/20 text-crimson-400 border border-crimson-700/30"
                    : "text-text-muted bg-navy-800/50 border border-border-subtle hover:text-text-secondary"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((referral, i) => (
              <div
                key={referral.id}
                className="bg-surface rounded-xl border border-border p-5 animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={referral.status} />
                        <span className="text-xs text-text-muted">
                          {formatRelativeTime(referral.submitted_at)}
                        </span>
                      </div>

                      <p className="text-base font-semibold text-text-primary font-[family-name:var(--font-display)]">
                        Lead: {referral.lead_name}
                      </p>
                      <p className="text-sm text-text-secondary mt-0.5">
                        {referral.offer?.title}
                      </p>

                      {/* Referrer info */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <User size={12} />
                          Referred by:{" "}
                          <span className="text-text-secondary font-medium">
                            {referral.referrer?.full_name}
                          </span>
                        </div>
                        {referral.referrer?.rating_avg > 0 && (
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Star size={12} className="text-warning" />
                            {referral.referrer.rating_avg.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Lead context */}
                      <p className="text-sm text-text-muted mt-2 bg-navy-800/40 p-3 rounded-lg">
                        &ldquo;{referral.lead_context}&rdquo;
                      </p>

                      {/* Contact info */}
                      <div className="flex gap-4 mt-2 text-xs text-text-muted">
                        {referral.lead_email && (
                          <span>{referral.lead_email}</span>
                        )}
                        {referral.lead_phone && (
                          <span>{referral.lead_phone}</span>
                        )}
                        {referral.relationship && (
                          <span>Relationship: {referral.relationship}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} className="text-forest-400" />
                          {feeDisplay(
                            referral.fee_type,
                            referral.flat_fee_amount,
                            referral.percentage_fee
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-stretch gap-2 shrink-0 w-full sm:w-auto">
                      {referral.status === "submitted" && (
                        <>
                          <button
                            onClick={() => handleAccept(referral.id)}
                            disabled={actionLoading === referral.id}
                            className="btn-primary text-xs flex items-center gap-1.5 py-2"
                          >
                            <CheckCircle2 size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleReject(referral.id)}
                            disabled={actionLoading === referral.id}
                            className="btn-ghost text-xs flex items-center gap-1.5 text-crimson-400 hover:text-crimson-300"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {referral.status === "accepted" && (
                        <>
                          {closureId === referral.id ? (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">
                                  $
                                </span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.01"
                                  value={dealValue}
                                  onChange={(e) => setDealValue(e.target.value)}
                                  placeholder="Deal value"
                                  className="input-field text-xs py-2 pl-6 w-28"
                                />
                              </div>
                              <button
                                onClick={() => handleCloseDeal(referral.id)}
                                disabled={actionLoading === referral.id}
                                className="btn-primary text-xs py-2"
                              >
                                Close
                              </button>
                              <button
                                onClick={() => {
                                  setClosureId(null);
                                  setDealValue("");
                                }}
                                className="btn-ghost text-xs py-2"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setClosureId(referral.id)}
                              className="btn-secondary text-xs flex items-center gap-1.5 py-2"
                            >
                              <DollarSign size={14} /> Report Closure
                            </button>
                          )}
                        </>
                      )}
                      {referral.status === "completed" &&
                        referral.business_rating_of_referrer == null && (
                          <button
                            onClick={() =>
                              setReviewModal({
                                referralId: referral.id,
                                revieweeName: referral.referrer?.full_name ?? "this referrer",
                              })
                            }
                            className="btn-secondary text-xs flex items-center gap-1.5 py-2"
                          >
                            <Star size={13} /> Leave Review
                          </button>
                        )}
                      {referral.status === "completed" &&
                        referral.business_rating_of_referrer != null && (
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
              </div>
            ))}
          </div>
        </>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          referralId={reviewModal.referralId}
          role="business"
          revieweeName={reviewModal.revieweeName}
          onClose={() => setReviewModal(null)}
          onSubmitted={() => {
            setReferrals((prev) =>
              prev.map((r) =>
                r.id === reviewModal.referralId
                  ? { ...r, business_rating_of_referrer: -1 }
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
