"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { signInWithEmail, signInWithOAuth } from "@/lib/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const [error, setError] = useState(() => {
    if (errorParam === "config") {
      return "Server configuration error: Supabase credentials are missing or invalid. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (use the anon or Publishable key from Supabase Dashboard > Project Settings > API).";
    }
    if (errorParam === "auth_callback_error") {
      return "Authentication failed. Please try again or sign in with email and password.";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    if (redirect) formData.set("redirect", redirect);
    const result = await signInWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "linkedin_oidc") {
    await signInWithOAuth(provider, redirect);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-crimson-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 justify-center mb-10"
        >
          <div className="w-10 h-10 bg-crimson-600 rounded-xl flex items-center justify-center shadow-lg shadow-crimson-900/40">
            <span className="text-white font-bold text-base font-[family-name:var(--font-display)]">
              CA
            </span>
          </div>
          <span className="text-text-primary font-semibold font-[family-name:var(--font-display)] tracking-wide">
            COMMISSION ARMY
          </span>
        </Link>

        <div className="bg-surface rounded-2xl border border-border p-8">
          <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] text-center mb-1">
            Welcome Back
          </h1>
          <p className="text-sm text-text-muted text-center mb-6">
            Sign in to your account
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-crimson-900/20 border border-crimson-800/30 mb-4">
              <AlertCircle
                size={16}
                className="text-crimson-400 shrink-0 mt-0.5"
              />
              <p className="text-sm text-crimson-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Your password"
                  className="input-field pl-9"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-text-muted">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p className="text-sm text-text-muted text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-crimson-400 hover:text-crimson-300 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex justify-center">
        <div className="w-8 h-8 border-2 border-navy-600 border-t-crimson-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
