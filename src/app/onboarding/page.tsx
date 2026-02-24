"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Users,
  AlertCircle,
} from "lucide-react";
import { updateProfile } from "@/lib/actions/auth";
import { createBusiness } from "@/lib/actions/businesses";
import { US_STATES, BUSINESS_CATEGORIES } from "@/config/constants";
import type { UserRole, BusinessCategory } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Role
  const [role, setRole] = useState<UserRole | null>(null);

  // Step 2: Profile
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Step 3: Business (if business/both)
  const [bizName, setBizName] = useState("");
  const [bizCategory, setBizCategory] = useState<BusinessCategory>("trades");
  const [bizCity, setBizCity] = useState("");
  const [bizState, setBizState] = useState("");
  const [bizDescription, setBizDescription] = useState("");

  const needsBusiness = role === "business" || role === "both";
  const totalSteps = needsBusiness ? 3 : 2;

  async function handleNext() {
    if (step === 1 && !role) {
      setError("Please select a role");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
      setError("");
      return;
    }

    // Final step: save everything
    setLoading(true);
    setError("");

    // Update profile
    const profileResult = await updateProfile({
      role,
      phone: phone || undefined,
      city: city || undefined,
      state: state || undefined,
      onboarding_complete: true,
    });

    if (profileResult.error) {
      setError(profileResult.error);
      setLoading(false);
      return;
    }

    // Create business if needed
    if (needsBusiness && bizName) {
      const bizResult = await createBusiness({
        name: bizName,
        category: bizCategory,
        city: bizCity || city,
        state: bizState || state,
        description: bizDescription || undefined,
      });
      if (bizResult.error) {
        setError(bizResult.error);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-navy-700/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 justify-center mb-8"
        >
          <div className="w-10 h-10 bg-crimson-600 rounded-xl flex items-center justify-center shadow-lg shadow-crimson-900/40">
            <span className="text-white font-bold text-base font-[family-name:var(--font-display)]">
              CA
            </span>
          </div>
        </Link>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step
                  ? "bg-crimson-500 w-8"
                  : i === step
                    ? "bg-navy-600 w-8"
                    : "bg-navy-800 w-4"
              }`}
            />
          ))}
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-6">
              <AlertCircle
                size={16}
                className="text-crimson-400 shrink-0 mt-0.5"
              />
              <p className="text-sm text-crimson-300">{error}</p>
            </div>
          )}

          {/* Step 1: Choose Role */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] text-center mb-2">
                How will you use Commission Army?
              </h1>
              <p className="text-sm text-text-muted text-center mb-8">
                You can always change this later
              </p>

              <div className="space-y-3">
                {[
                  {
                    value: "referrer" as const,
                    icon: Users,
                    label: "I want to earn commissions",
                    desc: "Browse offers and submit referrals from your network",
                  },
                  {
                    value: "business" as const,
                    icon: Briefcase,
                    label: "I want qualified referrals",
                    desc: "Post offers and pay for leads that convert",
                  },
                  {
                    value: "both" as const,
                    icon: User,
                    label: "Both",
                    desc: "Earn commissions and receive referrals",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRole(option.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      role === option.value
                        ? "bg-crimson-600/10 border-crimson-700/40"
                        : "bg-navy-800/30 border-border-subtle hover:bg-navy-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          role === option.value
                            ? "bg-crimson-900/40"
                            : "bg-navy-800"
                        }`}
                      >
                        <option.icon
                          size={18}
                          className={
                            role === option.value
                              ? "text-crimson-400"
                              : "text-navy-400"
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {option.label}
                        </p>
                        <p className="text-xs text-text-muted">{option.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] text-center mb-2">
                Your Details
              </h1>
              <p className="text-sm text-text-muted text-center mb-6">
                Help businesses and referrers find you
              </p>

              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">
                  Phone (optional)
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
              <div className="grid grid-cols-2 gap-3">
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
                    <option value="">Select</option>
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Business (if applicable) */}
          {step === 3 && needsBusiness && (
            <div className="animate-fade-in space-y-4">
              <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] text-center mb-2">
                Register Your Business
              </h1>
              <p className="text-sm text-text-muted text-center mb-6">
                Tell us about your business to start receiving referrals
              </p>

              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Acme Services"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">
                  Category
                </label>
                <select
                  value={bizCategory}
                  onChange={(e) =>
                    setBizCategory(e.target.value as BusinessCategory)
                  }
                  className="select-field"
                >
                  {Object.entries(BUSINESS_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={bizCity}
                    onChange={(e) => setBizCity(e.target.value)}
                    placeholder={city || "City"}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted mb-1 block">
                    State
                  </label>
                  <select
                    value={bizState}
                    onChange={(e) => setBizState(e.target.value)}
                    className="select-field"
                  >
                    <option value="">{state || "Select"}</option>
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">
                  Description
                </label>
                <textarea
                  value={bizDescription}
                  onChange={(e) => setBizDescription(e.target.value)}
                  placeholder="What does your business do?"
                  className="textarea-field"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-ghost text-sm flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step < totalSteps ? (
                <>
                  Continue <ArrowRight size={14} />
                </>
              ) : (
                <>
                  {loading ? "Finishing..." : "Get Started"}{" "}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
