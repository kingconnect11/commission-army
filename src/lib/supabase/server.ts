/**
 * Server-side Supabase client.
 * Use this in Server Components, Route Handlers, and Server Actions.
 *
 * Note: No Database generic until we generate types from Supabase CLI.
 * Cast query results to types from @/types.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { validateSupabaseEnv } from "@/lib/env";

export async function createClient() {
  validateSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — middleware handles refresh.
          }
        },
      },
    }
  );
}

/**
 * Admin client using service_role key.
 * Bypasses RLS. ONLY use in secure server contexts (webhooks, cron).
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
