"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  // Referrer stats
  totalReferralsSent?: number;
  pendingReferrals?: number;
  acceptedReferrals?: number;
  completedReferrals?: number;
  totalEarned?: number;
  pendingEarnings?: number;

  // Business stats
  totalReferralsReceived?: number;
  activeOffers?: number;
  totalSpent?: number;
  averageRating?: number;
}

/**
 * Get dashboard statistics for the current user.
 * Returns different stats based on user role.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, rating_avg")
    .eq("id", user.id)
    .single();

  if (!profile) return {};

  const stats: DashboardStats = {};

  // Referrer stats
  if (profile.role === "referrer" || profile.role === "both") {
    const { count: totalSent } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id);

    const { count: pending } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .eq("status", "submitted");

    const { count: accepted } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .eq("status", "accepted");

    const { count: completed } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .eq("status", "completed");

    // Calculate total earned (completed referrals)
    const { data: earnings } = await supabase
      .from("referrals")
      .select("referrer_payout, referrer_bonus_payout")
      .eq("referrer_id", user.id)
      .in("status", ["completed", "accepted"]);

    const totalEarned = (earnings ?? []).reduce((sum, r) => {
      return sum + (r.referrer_payout ?? 0) + (r.referrer_bonus_payout ?? 0);
    }, 0);

    // Pending earnings (accepted but not yet paid out)
    const { data: pendingPayouts } = await supabase
      .from("referrals")
      .select("referrer_payout")
      .eq("referrer_id", user.id)
      .eq("status", "accepted")
      .is("escrow_released_at", null);

    const pendingEarnings = (pendingPayouts ?? []).reduce(
      (sum, r) => sum + (r.referrer_payout ?? 0),
      0
    );

    stats.totalReferralsSent = totalSent ?? 0;
    stats.pendingReferrals = pending ?? 0;
    stats.acceptedReferrals = accepted ?? 0;
    stats.completedReferrals = completed ?? 0;
    stats.totalEarned = Math.round(totalEarned * 100) / 100;
    stats.pendingEarnings = Math.round(pendingEarnings * 100) / 100;
  }

  // Business stats
  if (profile.role === "business" || profile.role === "both") {
    const { data: myBusinesses } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id);

    const businessIds = (myBusinesses ?? []).map((b) => b.id);

    if (businessIds.length > 0) {
      const { count: received } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .in("business_id", businessIds);

      const { count: activeOffers } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .in("business_id", businessIds)
        .eq("is_active", true);

      // Total spent on referrals
      const { data: spending } = await supabase
        .from("referrals")
        .select("flat_fee_amount, success_bonus")
        .in("business_id", businessIds)
        .in("status", ["accepted", "completed"]);

      const totalSpent = (spending ?? []).reduce((sum, r) => {
        return sum + (r.flat_fee_amount ?? 0) + (r.success_bonus ?? 0);
      }, 0);

      stats.totalReferralsReceived = received ?? 0;
      stats.activeOffers = activeOffers ?? 0;
      stats.totalSpent = Math.round(totalSpent * 100) / 100;
    }

    stats.averageRating = profile.rating_avg ?? 0;
  }

  return stats;
}
