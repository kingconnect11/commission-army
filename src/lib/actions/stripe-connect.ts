"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createConnectAccount,
  createOnboardingLink,
  checkAccountStatus,
} from "@/lib/stripe";

/**
 * Start or resume Stripe Connect onboarding for the current user.
 * Returns a URL to redirect to, or status if already complete.
 */
export async function startStripeOnboarding(returnPath = "/dashboard/settings") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, stripe_account_id, stripe_onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  // Already done
  if (profile.stripe_onboarding_complete) {
    return { alreadyComplete: true };
  }

  let accountId = profile.stripe_account_id;

  // Create new account if needed
  if (!accountId) {
    try {
      accountId = await createConnectAccount(profile.email);
      await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    } catch (err) {
      console.error("Error creating Connect account:", err);
      return { error: "Failed to create payment account" };
    }
  }

  // Generate onboarding link
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  try {
    const url = await createOnboardingLink(
      accountId,
      `${baseUrl}${returnPath}?stripe_onboarding=complete`,
      `${baseUrl}${returnPath}?stripe_onboarding=refresh`
    );
    return { url };
  } catch (err) {
    console.error("Error creating onboarding link:", err);
    return { error: "Failed to generate payment setup link" };
  }
}

/**
 * Check the current user's Stripe Connect account status.
 */
export async function getStripeStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  if (!profile.stripe_account_id) {
    return { hasAccount: false, onboardingComplete: false };
  }

  // If we think onboarding is complete, trust the DB
  if (profile.stripe_onboarding_complete) {
    return { hasAccount: true, onboardingComplete: true };
  }

  // Otherwise check with Stripe (they might have finished onboarding
  // via the link but webhook hasn't fired yet)
  try {
    const status = await checkAccountStatus(profile.stripe_account_id);

    if (status.chargesEnabled && status.payoutsEnabled) {
      // Update our DB
      await supabase
        .from("profiles")
        .update({ stripe_onboarding_complete: true })
        .eq("id", user.id);

      return { hasAccount: true, onboardingComplete: true };
    }

    return {
      hasAccount: true,
      onboardingComplete: false,
      detailsSubmitted: status.detailsSubmitted,
    };
  } catch {
    return {
      hasAccount: true,
      onboardingComplete: false,
    };
  }
}
