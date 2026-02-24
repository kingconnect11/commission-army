"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin dashboard metrics.
 * Only accessible to users with admin role (for now, check against a hardcoded list).
 */

const ADMIN_EMAILS = [
  "kingconnection@icloud.com", // Philip
  // Add Roger and Mike's emails here
];

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email ?? "");
}

export interface PlatformMetrics {
  totalUsers: number;
  totalBusinesses: number;
  totalOffers: number;
  totalReferrals: number;
  referralsByStatus: Record<string, number>;
  totalTransactionVolume: number;
  platformRevenue: number;
  unresolvedFraudSignals: number;
}

export async function getPlatformMetrics(): Promise<PlatformMetrics | null> {
  if (!(await isAdmin())) return null;

  const admin = createAdminClient();

  const [users, businesses, offers, referrals, fraud] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("businesses").select("*", { count: "exact", head: true }),
    admin
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    admin.from("referrals").select("*", { count: "exact", head: true }),
    admin
      .from("fraud_signals")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false),
  ]);

  // Referrals by status
  const { data: allReferrals } = await admin
    .from("referrals")
    .select("status, platform_fee, platform_bonus_fee, flat_fee_amount, success_bonus");

  const referralsByStatus: Record<string, number> = {};
  let totalVolume = 0;
  let platformRevenue = 0;

  for (const r of allReferrals ?? []) {
    referralsByStatus[r.status] = (referralsByStatus[r.status] ?? 0) + 1;
    if (r.status === "accepted" || r.status === "completed") {
      totalVolume += (r.flat_fee_amount ?? 0) + (r.success_bonus ?? 0);
      platformRevenue += (r.platform_fee ?? 0) + (r.platform_bonus_fee ?? 0);
    }
  }

  return {
    totalUsers: users.count ?? 0,
    totalBusinesses: businesses.count ?? 0,
    totalOffers: offers.count ?? 0,
    totalReferrals: referrals.count ?? 0,
    referralsByStatus,
    totalTransactionVolume: Math.round(totalVolume * 100) / 100,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
    unresolvedFraudSignals: fraud.count ?? 0,
  };
}

/**
 * Get recent referrals for admin review.
 */
export async function getRecentReferrals(limit = 20) {
  if (!(await isAdmin())) return [];

  const admin = createAdminClient();

  const { data } = await admin
    .from("referrals")
    .select(
      `
      *,
      offer:offers(id, title),
      referrer:profiles(id, full_name, email),
      business:businesses(id, name)
    `
    )
    .order("submitted_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
