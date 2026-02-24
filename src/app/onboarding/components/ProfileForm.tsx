"use client";

import { US_STATES, VALIDATION } from "@/config/constants";

export interface ProfileFormData {
  full_name: string;
  phone: string;
  city: string;
  state: string;
  bio: string;
  linkedin_url: string;
}

interface ProfileFormProps {
  data: ProfileFormData;
  onChange: (data: ProfileFormData) => void;
  errors?: Partial<Record<keyof ProfileFormData, string>>;
  disabled?: boolean;
}

export function ProfileForm({ data, onChange, errors = {}, disabled }: ProfileFormProps) {
  const update = (field: keyof ProfileFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="full_name" className="text-xs font-medium text-text-muted mb-1 block">Full name</label>
        <input
          id="full_name"
          value={data.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          placeholder="Jane Smith"
          autoComplete="name"
          required
          minLength={VALIDATION.fullName.min}
          maxLength={VALIDATION.fullName.max}
          disabled={disabled}
          aria-invalid={!!errors.full_name}
          className="input-field"
        />
        {errors.full_name && <p className="text-xs text-crimson-400 mt-1">{errors.full_name}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="text-xs font-medium text-text-muted mb-1 block">Phone</label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(555) 123-4567"
          autoComplete="tel"
          disabled={disabled}
          aria-invalid={!!errors.phone}
          className="input-field"
        />
        {errors.phone && <p className="text-xs text-crimson-400 mt-1">{errors.phone}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="text-xs font-medium text-text-muted mb-1 block">City</label>
          <input
            id="city"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="San Francisco"
            autoComplete="address-level2"
            disabled={disabled}
            aria-invalid={!!errors.city}
            className="input-field"
          />
          {errors.city && <p className="text-xs text-crimson-400 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="state" className="text-xs font-medium text-text-muted mb-1 block">State</label>
          <select
            id="state"
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
      <div>
        <label htmlFor="bio" className="text-xs font-medium text-text-muted mb-1 block">Bio</label>
        <textarea
          id="bio"
          value={data.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="A short intro for referrers or businesses you work with..."
          rows={3}
          maxLength={VALIDATION.bio.max}
          disabled={disabled}
          aria-invalid={!!errors.bio}
          className="textarea-field"
        />
        {errors.bio && <p className="text-xs text-crimson-400 mt-1">{errors.bio}</p>}
      </div>
      <div>
        <label htmlFor="linkedin_url" className="text-xs font-medium text-text-muted mb-1 block">LinkedIn URL</label>
        <input
          id="linkedin_url"
          type="url"
          value={data.linkedin_url}
          onChange={(e) => update("linkedin_url", e.target.value)}
          placeholder="https://linkedin.com/in/username"
          autoComplete="url"
          disabled={disabled}
          aria-invalid={!!errors.linkedin_url}
          className="input-field"
        />
        {errors.linkedin_url && <p className="text-xs text-crimson-400 mt-1">{errors.linkedin_url}</p>}
      </div>
    </div>
  );
}
