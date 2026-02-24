import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/config/constants";
import type { OfferWithBusiness } from "@/types";
import type { BusinessCategory } from "@/types";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: OfferWithBusiness;
  className?: string;
}

function formatFee(offer: OfferWithBusiness): string {
  const { fee_type, flat_fee, percentage_fee, percentage_description } = offer;
  if (fee_type === "flat" && flat_fee != null) return `$${Number(flat_fee).toLocaleString()} flat`;
  if (fee_type === "percentage" && percentage_fee != null) {
    const desc = percentage_description?.trim() || "of deal";
    return `${percentage_fee}% ${desc}`;
  }
  if (fee_type === "flat_plus_percentage") {
    const parts: string[] = [];
    if (flat_fee != null) parts.push(`$${Number(flat_fee).toLocaleString()}`);
    if (percentage_fee != null) {
      const desc = percentage_description?.trim() || "bonus";
      parts.push(`${percentage_fee}% ${desc}`);
    }
    return parts.join(" + ") || "—";
  }
  return "—";
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function OfferCard({ offer, className }: OfferCardProps) {
  const business = offer.business;
  const categoryLabel = BUSINESS_CATEGORIES[business.category as BusinessCategory] ?? business.category;
  const location = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <article className={cn("flex flex-col bg-surface rounded-xl border border-border p-5 card-hover", className)}>
      <div className="flex items-start gap-3">
        {business.logo_url ? (
          <img src={business.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-text-secondary font-[family-name:var(--font-display)]">
              {getInitials(business.name)}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-text-primary font-[family-name:var(--font-display)] truncate">{offer.title}</h2>
          <p className="text-sm text-text-muted">{business.name}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-forest-400">{formatFee(offer)}</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-navy-800 text-text-secondary border border-border-subtle">
          {categoryLabel}
        </span>
      </div>
      {location && <p className="text-xs text-text-muted mt-1">{location}</p>}
      <Link href={`/dashboard/offers/${offer.id}`} className="btn-primary mt-4 text-sm flex items-center justify-center gap-1.5 py-2.5">
        Submit Referral
        <ArrowRight size={14} />
      </Link>
    </article>
  );
}
