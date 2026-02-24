"use client";

import { BUSINESS_CATEGORIES, US_STATES, VALIDATION } from "@/config/constants";
import type { BusinessCategory } from "@/types";

export interface BusinessFormData {
  name: string;
  category: BusinessCategory | "";
  description: string;
  website: string;
  phone: string;
  city: string;
  state: string;
}

interface BusinessFormProps {
  data: BusinessFormData;
  onChange: (data: BusinessFormData) => void;
  errors?: Partial<Record<keyof BusinessFormData, string>>;
  disabled?: boolean;
}

const CATEGORY_ENTRIES = Object.entries(BUSINESS_CATEGORIES) as [BusinessCategory, string][];

export function BusinessForm({ data, onChange, errors = {}, disabled }: BusinessFormProps) {
  const update = (field: keyof BusinessFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="business_name" className="text-xs font-medium text-text-muted mb-1 block">Business name</label>
        <input
          id="business_name"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Acme Services LLC"
          required
          minLength={VALIDATION.businessName.min}
          maxLength={VALIDATION.businessName.max}
          disabled={disabled}
          aria-invalid={!!errors.name}
          className="input-field"
        />
        {errors.name && <p className="text-xs text-crimson-400 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="category" className="text-xs font-medium text-text-muted mb-1 block">Category</label>
        <select
          id="category"
          value={data.category}
          onChange={(e) => update("category", e.target.value as BusinessCategory)}
          disabled={disabled}
          aria-invalid={!!errors.category}
          className="select-field"
        >
          <option value="">Select category</option>
          {CATEGORY_ENTRIES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-crimson-400 mt-1">{errors.category}</p>}
      </div>
      <div>
        <label htmlFor="business_description" className="text-xs font-medium text-text-muted mb-1 block">Description</label>
        <textarea
          id="business_description"
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What your business does and who you serve..."
          rows={3}
          disabled={disabled}
          aria-invalid={!!errors.description}
          className="textarea-field"
        />
        {errors.description && <p className="text-xs text-crimson-400 mt-1">{errors.description}</p>}
      </div>
      <div>
        <label htmlFor="website" className="text-xs font-medium text-text-muted mb-1 block">Website</label>
        <input
          id="website"
          type="url"
          value={data.website}
          onChange={(e) => update("website", e.target.value)}
          placeholder="https://example.com"
          autoComplete="url"
          disabled={disabled}
          aria-invalid={!!errors.website}
          className="input-field"
        />
        {errors.website && <p className="text-xs text-crimson-400 mt-1">{errors.website}</p>}
      </div>
      <div>
        <label htmlFor="business_phone" className="text-xs font-medium text-text-muted mb-1 block">Business phone</label>
        <input
          id="business_phone"
          type="tel"
          inputMode="tel"
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(555) 123-4567"
          disabled={disabled}
          aria-invalid={!!errors.phone}
          className="input-field"
        />
        {errors.phone && <p className="text-xs text-crimson-400 mt-1">{errors.phone}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="business_city" className="text-xs font-medium text-text-muted mb-1 block">City</label>
          <input
            id="business_city"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="San Francisco"
            required
            disabled={disabled}
            aria-invalid={!!errors.city}
            className="input-field"
          />
          {errors.city && <p className="text-xs text-crimson-400 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="business_state" className="text-xs font-medium text-text-muted mb-1 block">State</label>
          <select
            id="business_state"
            value={data.state}
            onChange={(e) => update("state", e.target.value)}
            disabled={disabled}
            aria-invalid={!!errors.state}
            className="select-field"
          >
            <option value="">Select state</option>
            {US_STATES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-crimson-400 mt-1">{errors.state}</p>}
        </div>
      </div>
    </div>
  );
}
