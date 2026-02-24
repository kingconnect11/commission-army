import Link from "next/link";

export default function ForgotPasswordPage() {
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
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-2">Forgot password</h1>
          <p className="text-sm text-text-muted mb-6">
            Password reset is not yet available. Please contact support or try signing in with Google.
          </p>
          <Link href="/auth/login" className="btn-ghost text-sm inline-flex items-center gap-1.5">
            ← Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
