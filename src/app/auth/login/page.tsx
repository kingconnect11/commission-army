"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { signInWithEmail, signInWithOAuth } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "linkedin" | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await signInWithEmail(formData);
      if (result && "error" in result) { setError(result.error ?? null); return; }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "linkedin_oidc") {
    setError(null);
    setOauthLoading(provider === "google" ? "google" : "linkedin");
    try {
      const result = await signInWithOAuth(provider);
      if (result && "error" in result) setError(result.error);
    } finally {
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-crimson-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-10 h-10 bg-crimson-600 rounded-xl flex items-center justify-center shadow-lg shadow-crimson-900/40">
            <span className="text-white font-bold text-base font-[family-name:var(--font-display)]">CA</span>
          </div>
          <span className="text-text-primary font-semibold font-[family-name:var(--font-display)] tracking-wide">COMMISSION ARMY</span>
        </Link>

        <div className="bg-surface rounded-2xl border border-border p-8">
          <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] text-center mb-1">Log in</h1>
          <p className="text-sm text-text-muted text-center mb-6">Sign in to your Commission Army account</p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-4">
              <p className="text-sm text-crimson-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input-field pl-9" disabled={isLoading} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-text-muted" htmlFor="password">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="input-field pl-9" disabled={isLoading} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isLoading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-surface px-3 text-text-muted">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={!!oauthLoading} onClick={() => handleOAuth("google")} className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2">
              {oauthLoading === "google" ? <div className="w-4 h-4 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" /> : "Google"}
            </button>
            <button type="button" disabled={!!oauthLoading} onClick={() => handleOAuth("linkedin_oidc")} className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2">
              {oauthLoading === "linkedin" ? <div className="w-4 h-4 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" /> : "LinkedIn"}
            </button>
          </div>
        </div>

        <p className="text-sm text-text-muted text-center mt-6">
          No account?{" "}
          <Link href="/auth/signup" className="text-crimson-400 hover:text-crimson-300 font-medium transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
