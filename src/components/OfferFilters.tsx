"use client";

import { Search } from "lucide-react";
import { BUSINESS_CATEGORIES, US_STATES } from "@/config/constants";
import type { BusinessCategory } from "@/types";

interface OfferFiltersProps {
  category: string;
  state: string;
  search: string;
  onCategoryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  ...(Object.entries(BUSINESS_CATEGORIES) as [BusinessCategory, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];

const STATE_OPTIONS = [
  { value: "", label: "All states" },
  ...US_STATES.map(({ value, label }) => ({ value, label })),
];

export function OfferFilters({
  category,
  state,
  search,
  onCategoryChange,
  onStateChange,
  onSearchChange,
  disabled,
}: OfferFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search offers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
          className="input-field pl-9"
        />
      </div>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        disabled={disabled}
        className="select-field sm:w-[180px]"
      >
        {CATEGORY_OPTIONS.map(({ value, label }) => (
          <option key={value || "all"} value={value}>{label}</option>
        ))}
      </select>
      <select
        value={state}
        onChange={(e) => onStateChange(e.target.value)}
        disabled={disabled}
        className="select-field sm:w-[180px]"
      >
        {STATE_OPTIONS.map(({ value, label }) => (
          <option key={value || "all"} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
