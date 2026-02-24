/**
 * POST /api/stripe/connect
 *
 * Creates a Stripe Connect Express account for the current user
 * and returns an onboarding URL to redirect them to.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createConnectAccount, createOnboardingLink } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already has a Connect account
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarding_complete, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let accountId = profile.stripe_account_id;

  // Create new Connect account if they don't have one
  if (!accountId) {
    accountId = await createConnectAccount(profile.email);

    await supabase
      .from("profiles")
      .update({ stripe_account_id: accountId })
      .eq("id", user.id);
  }

  // If already onboarded, return success
  if (profile.stripe_onboarding_complete) {
    return NextResponse.json({ already_complete: true });
  }

  // Generate onboarding link
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const onboardingUrl = await createOnboardingLink(
    accountId,
    `${baseUrl}/dashboard?stripe_onboarding=complete`,
    `${baseUrl}/dashboard?stripe_onboarding=refresh`
  );

  return NextResponse.json({ url: onboardingUrl });
}
