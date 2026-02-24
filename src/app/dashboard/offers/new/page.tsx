"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createOffer } from "@/lib/actions/offers";
import { getMyBusinesses } from "@/lib/actions/businesses";
import { useToast } from "@/components/Toast";
import {
  BUSINESS_CATEGORIES,
  FEE_TYPE_LABELS,
  VALIDATION,
  MIN_REFERRAL_FEE,
} from "@/config/constants";
import type { Business, FeeType, OfferInsert } from "@/types";
import Link from "next/link";

export default function CreateOfferPage() {
  const router = useRouter();
  const toast = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form
  const [businessId, setBusinessId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whatINeed, setWhatINeed] = useState("");
  const [feeType, setFeeType] = useState<FeeType>("flat");
  const [flatFee, setFlatFee] = useState("");
  const [percentageFee, setPercentageFee] = useState("");
  const [percentageDesc, setPercentageDesc] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [qualificationCriteria, setQualificationCriteria] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getMyBusinesses();
      setBusinesses(data as Business[]);
      if (data.length > 0) setBusinessId((data[0] as Business).id);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const data: OfferInsert = {
      business_id: businessId,
      title,
      description,
      what_i_need: whatINeed,
      fee_type: feeType,
      flat_fee:
        feeType === "flat" || feeType === "flat_plus_percentage"
          ? parseFloat(flatFee)
          : undefined,
      percentage_fee:
        feeType === "percentage" || feeType === "flat_plus_percentage"
          ? parseFloat(percentageFee)
          : undefined,
      percentage_description:
        feeType !== "flat" ? percentageDesc || undefined : undefined,
      max_fee: maxFee ? parseFloat(maxFee) : undefined,
      qualification_criteria: qualificationCriteria || undefined,
    };

    const result = await createOffer(data);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
      toast.success("Offer created!");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-5 bg-navy-800 rounded w-24" />
        <div className="h-8 bg-navy-800 rounded w-1/2" />
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div className="h-10 bg-navy-800 rounded" />
          <div className="h-10 bg-navy-800 rounded" />
          <div className="h-24 bg-navy-800 rounded" />
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-14 h-14 bg-navy-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <PlusCircle size={24} className="text-navy-400" />
        </div>
        <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)] mb-2">
          No Business Found
        </h2>
        <p className="text-sm text-text-muted mb-6">
          You need to register a business before creating offers. Complete your
          onboarding to get started.
        </p>
        <Link href="/dashboard/settings" className="btn-primary text-sm">
          Go to Settings
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
          Offer Created!
        </h2>
        <p className="text-text-muted mb-6">
          Your referral offer is now live. People can start submitting referrals.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/my-offers" className="btn-primary text-sm">
            View My Offers
          </Link>
          <button
            onClick={() => {
              setSuccess(false);
              setTitle("");
              setDescription("");
              setWhatINeed("");
              setFlatFee("");
              setPercentageFee("");
              setQualificationCriteria("");
            }}
            className="btn-secondary text-sm"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-1">
        Create Referral Offer
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Describe what kind of referrals you want and how much you&apos;ll pay
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-6">
          <AlertCircle size={16} className="text-crimson-400 shrink-0 mt-0.5" />
          <p className="text-sm text-crimson-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider font-[family-name:var(--font-display)]">
            Offer Details
          </h2>

          {businesses.length > 1 && (
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Business
              </label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="select-field"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">
              Offer Title *
            </label>
            <input
              type="text"
              required
              minLength={VALIDATION.offerTitle.min}
              maxLength={VALIDATION.offerTitle.max}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Looking for homeowners who need kitchen remodeling"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">
              Description *
            </label>
            <textarea
              required
              minLength={VALIDATION.offerDescription.min}
              maxLength={VALIDATION.offerDescription.max}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business and the service you offer..."
              className="textarea-field"
              rows={4}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">
              What You&apos;re Looking For *
            </label>
            <textarea
              required
              minLength={10}
              value={whatINeed}
              onChange={(e) => setWhatINeed(e.target.value)}
              placeholder="Describe your ideal referral - who should they be connected to?"
              className="textarea-field"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">
              Qualification Criteria
            </label>
            <textarea
              value={qualificationCriteria}
              onChange={(e) => setQualificationCriteria(e.target.value)}
              placeholder="Optional: what makes a referral qualified?"
              className="textarea-field"
              rows={2}
            />
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider font-[family-name:var(--font-display)]">
            Commission Structure
          </h2>

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">
              Fee Type
            </label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value as FeeType)}
              className="select-field"
            >
              {Object.entries(FEE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {(feeType === "flat" || feeType === "flat_plus_percentage") && (
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Flat Fee Amount * (min ${MIN_REFERRAL_FEE})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  min={MIN_REFERRAL_FEE}
                  step="0.01"
                  value={flatFee}
                  onChange={(e) => setFlatFee(e.target.value)}
                  placeholder="50.00"
                  className="input-field pl-7"
                />
              </div>
            </div>
          )}

          {(feeType === "percentage" ||
            feeType === "flat_plus_percentage") && (
            <>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">
                  Percentage Fee * (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    required
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={percentageFee}
                    onChange={(e) => setPercentageFee(e.target.value)}
                    placeholder="5"
                    className="input-field pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">
                  Percentage Basis
                </label>
                <input
                  type="text"
                  value={percentageDesc}
                  onChange={(e) => setPercentageDesc(e.target.value)}
                  placeholder="e.g. 'of total project value'"
                  className="input-field"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">
              Max Fee Cap (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                placeholder="No cap"
                className="input-field pl-7"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <PlusCircle size={16} />
          )}
          {submitting ? "Creating..." : "Create Offer"}
        </button>
      </form>
    </div>
  );
}
