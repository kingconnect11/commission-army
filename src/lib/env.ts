/**
 * Environment validation for required Supabase config.
 * Fails fast with a clear message when vars are missing (e.g. wrong .env.local).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function validateSupabaseEnv(): void {
  const missing: string[] = [];
  if (!SUPABASE_URL || typeof SUPABASE_URL !== "string" || !SUPABASE_URL.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!SUPABASE_ANON_KEY || typeof SUPABASE_ANON_KEY !== "string" || !SUPABASE_ANON_KEY.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase config. Set ${missing.join(" and ")} in .env.local. ` +
        "Use the anon public key (or Publishable key) from Supabase Dashboard > Project Settings > API — not the service_role/Secret key."
    );
  }
}
