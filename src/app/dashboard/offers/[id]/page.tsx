"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  Target,
} from "lucide-react";
import { getOfferById } from "@/lib/actions/offers";
import { submitReferral } from "@/lib/actions/referrals";
import { useToast } from "@/components/Toast";
import { BUSINESS_CATEGORIES, FEE_TYPE_LABELS } from "@/config/constants";
import { feeDisplay, formatDate, cn } from "@/lib/utils";
import type { BusinessCategory, ReferralInsert } from "@/types";

interface OfferDetail {
  id: string;
  title: string;
  description: string;
  what_i_need: string;
  fee_type: string;
  flat_fee: number | null;
  percentage_fee: number | null;
  percentage_description: string | null;
  min_fee: number;
  max_fee: number | null;
  qualification_criteria: string | null;
  views_count: number;
  referrals_count: number;
  created_at: string;
  business: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    city: string;
    state: string;
    website: string | null;
  };
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadContext, setLeadContext] = useState("");
  const [relationship, setRelationship] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getOfferById(offerId);
      setOffer(data as unknown as OfferDetail);
      setLoading(false);
    }
    load();
  }, [offerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!offer) return;
    setSubmitting(true);
    setError("");

    const data: ReferralInsert = {
      offer_id: offer.id,
      business_id: offer.business.id,
      lead_name: leadName,
      lead_context: leadContext,
      lead_email: leadEmail || undefined,
      lead_phone: leadPhone || undefined,
      relationship: relationship || undefined,
    };

    const result = await submitReferral(data);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
      toast.success("Referral submitted!");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-5 bg-navy-800 rounded w-24 mb-6" />
        <div className="h-8 bg-navy-800 rounded w-2/3 mb-4" />
        <div className="h-4 bg-navy-800 rounded w-1/3 mb-8" />
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="space-y-3">
            <div className="h-4 bg-navy-800 rounded w-full" />
            <div className="h-4 bg-navy-800 rounded w-3/4" />
            <div className="h-4 bg-navy-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-text-muted">Offer not found</p>
        <Link href="/dashboard/offers" className="btn-primary mt-4 inline-block text-sm">
          Back to Offers
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <div className="w-16 h-16 bg-forest-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-forest-400" />
        </div>
        <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-2">
          Referral Submitted!
        </h2>
        <p className="text-text-muted mb-6">
          The business has been notified and will review your referral. You can
          track its progress in My Referrals.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/my-referrals" className="btn-primary text-sm">
            View My Referrals
          </Link>
          <Link href="/dashboard/offers" className="btn-secondary text-sm">
            Browse More Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400 bg-navy-800/60 px-2 py-0.5 rounded">
              {BUSINESS_CATEGORIES[offer.business.category as BusinessCategory] ??
                offer.business.category}
            </span>
            <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] mt-3 mb-1">
              {offer.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {offer.business.name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {offer.business.city},{" "}
                {offer.business.state}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {offer.views_count} views
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface rounded-xl border border-border p-6 animate-fade-in stagger-1 opacity-0">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-navy-400" />
              <h2 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)] uppercase tracking-wider">
                Description
              </h2>
            </div>
            <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {offer.description}
            </p>
          </div>

          {/* What They Need */}
          <div className="bg-surface rounded-xl border border-border p-6 animate-fade-in stagger-2 opacity-0">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-crimson-400" />
              <h2 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)] uppercase tracking-wider">
                What They&apos;re Looking For
              </h2>
            </div>
            <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {offer.what_i_need}
            </p>
          </div>

          {/* Qualification Criteria */}
          {offer.qualification_criteria && (
            <div className="bg-surface rounded-xl border border-border p-6 animate-fade-in stagger-3 opacity-0">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-forest-400" />
                <h2 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)] uppercase tracking-wider">
                  Qualification Criteria
                </h2>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {offer.qualification_criteria}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Fee Card */}
          <div className="bg-surface rounded-xl border border-crimson-800/30 p-5 animate-fade-in stagger-2 opacity-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Commission
            </p>
            <p className="text-2xl font-bold text-crimson-400 font-[family-name:var(--font-display)]">
              {feeDisplay(offer.fee_type, offer.flat_fee, offer.percentage_fee)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {FEE_TYPE_LABELS[offer.fee_type as keyof typeof FEE_TYPE_LABELS]}
              {offer.percentage_description && (
                <> &middot; {offer.percentage_description}</>
              )}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Posted {formatDate(offer.created_at)}
            </p>
          </div>

          {/* Submit Referral Button */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
            >
              <Send size={16} /> Submit a Referral
            </button>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-5 animate-scale-in">
              <h3 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)] mb-4">
                Submit Referral
              </h3>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-4">
                  <AlertCircle
                    size={16}
                    className="text-crimson-400 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-crimson-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    Lead Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="John Smith"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    Lead Email
                  </label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    Lead Phone
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    Your Relationship to Lead
                  </label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="Friend, colleague, neighbor..."
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    Context / Why This Lead Is Qualified *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    value={leadContext}
                    onChange={(e) => setLeadContext(e.target.value)}
                    placeholder="Tell the business why this person is a good fit..."
                    className="textarea-field text-sm"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm flex-1 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
