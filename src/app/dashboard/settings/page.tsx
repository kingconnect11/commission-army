"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ExternalLink,
  User,
  Link2,
} from "lucide-react";
import { getProfile, updateProfile } from "@/lib/actions/auth";
import {
  startStripeOnboarding,
  getStripeStatus,
} from "@/lib/actions/stripe-connect";
import { useToast } from "@/components/Toast";
import { US_STATES, VALIDATION } from "@/config/constants";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [stripeStatus, setStripeStatus] = useState<{
    hasAccount: boolean;
    onboardingComplete: boolean;
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Toast from Stripe redirect
  const stripeOnboarding = searchParams.get("stripe_onboarding");

  useEffect(() => {
    async function load() {
      const [p, stripe] = await Promise.all([
        getProfile(),
        getStripeStatus(),
      ]);
      if (p) {
        setProfile(p as Profile);
        setFullName(p.full_name || "");
        setPhone(p.phone || "");
        setCity(p.city || "");
        setState(p.state || "");
        setBio(p.bio || "");
        setLinkedinUrl(p.linkedin_url || "");
      }
      setStripeStatus(
        stripe as { hasAccount: boolean; onboardingComplete: boolean } | null
      );
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const result = await updateProfile({
      full_name: fullName,
      phone: phone || undefined,
      city: city || undefined,
      state: state || undefined,
      bio: bio || undefined,
      linkedin_url: linkedinUrl || undefined,
    });

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setSaved(true);
      toast.success("Profile saved");
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleStripeConnect() {
    setStripeLoading(true);
    const result = await startStripeOnboarding();

    if (result.alreadyComplete) {
      setStripeStatus({ hasAccount: true, onboardingComplete: true });
      setStripeLoading(false);
      return;
    }

    if (result.url) {
      window.location.href = result.url;
      return;
    }

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    }
    setStripeLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-navy-800 rounded w-1/4" />
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-navy-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
          Settings
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Manage your profile and payment settings
        </p>
      </div>

      {/* Stripe Toast */}
      {stripeOnboarding === "complete" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-forest-900/20 border border-forest-800/30 mb-6 animate-fade-in">
          <CheckCircle2 size={16} className="text-forest-400" />
          <p className="text-sm text-forest-300">
            Payment setup complete! You can now receive payments.
          </p>
        </div>
      )}
      {stripeOnboarding === "refresh" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-navy-800/40 border border-navy-700/30 mb-6 animate-fade-in">
          <AlertCircle size={16} className="text-navy-400" />
          <p className="text-sm text-navy-300">
            Payment setup needs attention. Please try again below.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-6">
          <AlertCircle size={16} className="text-crimson-400 shrink-0 mt-0.5" />
          <p className="text-sm text-crimson-300">{error}</p>
        </div>
      )}

      {/* Profile Section */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-navy-400" />
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider font-[family-name:var(--font-display)]">
              Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength={VALIDATION.fullName.min}
                maxLength={VALIDATION.fullName.max}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Phone
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="select-field"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={VALIDATION.bio.max}
                placeholder="Tell others about yourself..."
                className="textarea-field"
                rows={3}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-sm flex items-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={14} />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </form>

      {/* Stripe Connect Section */}
      <div className="bg-surface rounded-xl border border-border p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-crimson-400" />
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider font-[family-name:var(--font-display)]">
            Payment Setup
          </h2>
        </div>

        {stripeStatus?.onboardingComplete ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-forest-900/15 border border-forest-800/20">
            <CheckCircle2 size={20} className="text-forest-400" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                Payments Connected
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                You can receive commission payments
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-secondary mb-4">
              Connect your bank account through Stripe to receive commission
              payments. This is required before you can earn from referrals.
            </p>
            <button
              onClick={handleStripeConnect}
              disabled={stripeLoading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {stripeLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ExternalLink size={14} />
              )}
              {stripeLoading
                ? "Setting up..."
                : stripeStatus?.hasAccount
                  ? "Continue Setup"
                  : "Set Up Payments"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
