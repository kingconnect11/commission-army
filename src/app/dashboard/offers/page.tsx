"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  DollarSign,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { getActiveOffers } from "@/lib/actions/offers";
import type { OfferSortOption } from "@/lib/actions/offers";
import {
  BUSINESS_CATEGORIES,
  US_STATES,
} from "@/config/constants";
import { cn, feeDisplay } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import type { OfferWithBusiness, BusinessCategory } from "@/types";

const LIMIT = 12;
const DEBOUNCE_MS = 300;

const SORT_OPTIONS: { value: OfferSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "highest_fee", label: "Highest Fee" },
  { value: "most_views", label: "Most Views" },
];

function isHot(offer: OfferWithBusiness): boolean {
  return (offer.views_count ?? 0) > 50 || (offer.referrals_count ?? 0) > 5;
}

export default function BrowseOffersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  const [sort, setSort] = useState<OfferSortOption>(
    (searchParams.get("sort") as OfferSortOption) ?? "newest"
  );
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "0"));

  const [offers, setOffers] = useState<OfferWithBusiness[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync URL when filters change
  function pushToUrl(params: {
    q?: string;
    category?: string;
    state?: string;
    sort?: string;
    page?: number;
  }) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.state) sp.set("state", params.state);
    if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
    if (params.page && params.page > 0) sp.set("page", String(params.page));
    const query = sp.toString();
    router.replace(`/dashboard/offers${query ? `?${query}` : ""}`, { scroll: false });
  }

  // Handle search input with debounce
  function handleSearchChange(value: string) {
    setSearch(value);
    setSearchLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
      setSearchLoading(false);
    }, DEBOUNCE_MS);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    const result = await getActiveOffers({
      search: debouncedSearch || undefined,
      category: category || undefined,
      state: state || undefined,
      sort,
      limit: LIMIT,
      offset: page * LIMIT,
    });
    setOffers(result.data);
    setTotal(result.count);
    setLoading(false);
  }, [debouncedSearch, category, state, sort, page]);

  useEffect(() => {
    fetchOffers();
    // Sync URL
    pushToUrl({ q: debouncedSearch, category, state, sort, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOffers]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!debouncedSearch || !!category || !!state || sort !== "newest";

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setState("");
    setSort("newest");
    setPage(0);
  }

  function handleCategoryChange(val: string) {
    setCategory(val);
    setPage(0);
  }

  function handleStateChange(val: string) {
    setState(val);
    setPage(0);
  }

  function handleSortChange(val: OfferSortOption) {
    setSort(val);
    setPage(0);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            Browse Offers
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Find referral opportunities and start earning
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            "btn-secondary text-sm flex items-center gap-2 lg:hidden",
            filtersOpen && "bg-navy-600"
          )}
        >
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search with debounce indicator */}
          <div className="relative flex-1">
            {searchLoading ? (
              <Loader2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted animate-spin"
              />
            ) : (
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            )}
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Category */}
          <div className={cn("lg:block", filtersOpen ? "block" : "hidden")}>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="select-field lg:w-[200px]"
            >
              <option value="">All Categories</option>
              {Object.entries(BUSINESS_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className={cn("lg:block", filtersOpen ? "block" : "hidden")}>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="select-field lg:w-[180px]"
            >
              <option value="">All States</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className={cn("lg:flex items-center gap-2", filtersOpen ? "flex" : "hidden")}>
            <ArrowUpDown size={14} className="text-text-muted shrink-0" />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as OfferSortOption)}
              className="select-field lg:w-[160px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
            <span className="text-xs text-text-muted">
              {total} result{total !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1 font-medium ml-auto"
            >
              <X size={12} /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-border p-5 animate-pulse"
            >
              <div className="h-4 bg-navy-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-navy-800 rounded w-1/2 mb-4" />
              <div className="h-12 bg-navy-800 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-navy-800 rounded w-16" />
                <div className="h-6 bg-navy-800 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No offers found"
          description={
            hasFilters
              ? "Try adjusting your search or filters"
              : "No referral offers are available right now. Check back soon!"
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer, i) => (
              <Link
                key={offer.id}
                href={`/dashboard/offers/${offer.id}`}
                className="group bg-surface rounded-xl border border-border p-5 card-hover animate-fade-in opacity-0 relative"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Hot badge */}
                {isHot(offer) && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full">
                    <Flame size={10} className="fill-warning" />
                    Hot
                  </div>
                )}

                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400 bg-navy-800/60 px-2 py-0.5 rounded">
                    {BUSINESS_CATEGORIES[offer.business?.category as BusinessCategory] ??
                      offer.business?.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Eye size={12} /> {offer.views_count ?? 0}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-text-primary group-hover:text-crimson-400 transition-colors line-clamp-2 mb-1 font-[family-name:var(--font-display)]">
                  {offer.title}
                </h3>

                {/* Business name */}
                <p className="text-sm text-text-secondary mb-3">
                  {offer.business?.name}
                </p>

                {/* Description */}
                <p className="text-sm text-text-muted line-clamp-2 mb-4">
                  {offer.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-forest-400">
                    <DollarSign size={14} />
                    {feeDisplay(
                      offer.fee_type,
                      offer.flat_fee,
                      offer.percentage_fee
                    )}
                  </div>
                  {offer.business?.city && (
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <MapPin size={12} />
                      {offer.business.city}, {offer.business.state}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-text-secondary px-3">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
