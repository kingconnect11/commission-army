/**
 * Browser (client component) Supabase client.
 * Use this in "use client" components.
 *
 * Note: We don't pass Database generics until we generate types
 * from Supabase CLI. For now, use the raw client and cast results
 * to our types from @/types.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
