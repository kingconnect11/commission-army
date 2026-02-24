"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  Eye,
  Users,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  MapPin,
} from "lucide-react";
import { getMyOffers, toggleOfferActive } from "@/lib/actions/offers";
import { BUSINESS_CATEGORIES } from "@/config/constants";
import { feeDisplay, formatDate, cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import type { BusinessCategory } from "@/types";

interface OfferRow {
  id: string;
  title: string;
  description: string;
  fee_type: string;
  flat_fee: number | null;
  percentage_fee: number | null;
  is_active: boolean;
  views_count: number;
  referrals_count: number;
  created_at: string;
  business: {
    id: string;
    name: string;
    category: string;
    city: string;
    state: string;
  };
}

export default function MyOffersPage() {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMyOffers();
      setOffers(data as unknown as OfferRow[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleToggle(offerId: string) {
    await toggleOfferActive(offerId);
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId ? { ...o, is_active: !o.is_active } : o
      )
    );
  }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            My Offers
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Manage your referral offers
          </p>
        </div>
        <Link
          href="/dashboard/offers/new"
          className="btn-primary text-sm flex items-center gap-2"
        >
          <PlusCircle size={14} /> New Offer
        </Link>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No offers yet"
          description="Create your first referral offer to start receiving qualified leads"
          actionLabel="Create Offer"
          actionHref="/dashboard/offers/new"
        />
      ) : (
        <div className="space-y-3">
          {offers.map((offer, i) => (
            <div
              key={offer.id}
              className="bg-surface rounded-xl border border-border p-5 animate-fade-in opacity-0"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        offer.is_active ? "bg-forest-500" : "bg-slate-500"
                      )}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                      {BUSINESS_CATEGORIES[offer.business.category as BusinessCategory]}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/offers/${offer.id}`}
                    className="text-base font-semibold text-text-primary hover:text-crimson-400 transition-colors font-[family-name:var(--font-display)]"
                  >
                    {offer.title}
                  </Link>
                  <p className="text-sm text-text-muted mt-0.5">
                    {offer.business.name}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} className="text-forest-400" />
                      {feeDisplay(offer.fee_type, offer.flat_fee, offer.percentage_fee)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {offer.views_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {offer.referrals_count} referrals
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {offer.business.city}, {offer.business.state}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggle(offer.id)}
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    title={offer.is_active ? "Deactivate" : "Activate"}
                  >
                    {offer.is_active ? (
                      <>
                        <ToggleRight size={20} className="text-forest-500" />
                        <span className="text-forest-400">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} className="text-slate-500" />
                        <span className="text-slate-400">Paused</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
