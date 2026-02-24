"use server";

/**
 * Fraud detection checks.
 * These run server-side when referrals are submitted.
 * Uses the admin client to write to the fraud_signals table (no RLS access for users).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { FraudSignalType, FraudSeverity } from "@/types";

interface FraudCheckResult {
  passed: boolean;
  signals: Array<{
    type: FraudSignalType;
    severity: FraudSeverity;
    details: Record<string, unknown>;
  }>;
}

/**
 * Run all fraud checks on a referral submission.
 * Called internally before a referral is saved.
 */
export async function runFraudChecks(
  referrerId: string,
  businessId: string,
  leadEmail: string | null,
  leadPhone: string | null,
  offerId: string
): Promise<FraudCheckResult> {
  const signals: FraudCheckResult["signals"] = [];

  // Check 1: Self-referral (referrer owns the business)
  const selfRef = await checkSelfReferral(referrerId, businessId);
  if (selfRef) signals.push(selfRef);

  // Check 2: Velocity (too many referrals in short time)
  const velocity = await checkVelocity(referrerId);
  if (velocity) signals.push(velocity);

  // Check 3: Duplicate lead (same lead info to same business)
  if (leadEmail || leadPhone) {
    const duplicate = await checkDuplicateLead(
      businessId,
      offerId,
      leadEmail,
      leadPhone
    );
    if (duplicate) signals.push(duplicate);
  }

  // Log any signals found
  if (signals.length > 0) {
    await logFraudSignals(referrerId, null, signals);
  }

  // Block if any high severity signal
  const hasHighSeverity = signals.some((s) => s.severity === "high");

  return {
    passed: !hasHighSeverity,
    signals,
  };
}

/**
 * Check if the referrer owns the business they're referring to.
 */
async function checkSelfReferral(
  referrerId: string,
  businessId: string
): Promise<FraudCheckResult["signals"][0] | null> {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", businessId)
    .single();

  if (business && business.owner_id === referrerId) {
    return {
      type: "self_referral",
      severity: "high",
      details: {
        referrer_id: referrerId,
        business_id: businessId,
        reason: "Referrer owns the target business",
      },
    };
  }

  return null;
}

/**
 * Check if the referrer is submitting too many referrals too quickly.
 * Threshold: more than 10 referrals in the last hour.
 */
async function checkVelocity(
  referrerId: string
): Promise<FraudCheckResult["signals"][0] | null> {
  const supabase = await createClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", referrerId)
    .gte("submitted_at", oneHourAgo);

  if (count && count >= 10) {
    return {
      type: "velocity",
      severity: "medium",
      details: {
        referrer_id: referrerId,
        count_last_hour: count,
        threshold: 10,
        reason: "Unusually high submission rate",
      },
    };
  }

  return null;
}

/**
 * Check if the same lead (by email or phone) has already been submitted
 * to this business/offer recently.
 */
async function checkDuplicateLead(
  businessId: string,
  offerId: string,
  leadEmail: string | null,
  leadPhone: string | null
): Promise<FraudCheckResult["signals"][0] | null> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Check by email
  if (leadEmail) {
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("lead_email", leadEmail)
      .gte("submitted_at", thirtyDaysAgo);

    if (count && count > 0) {
      return {
        type: "duplicate_lead",
        severity: "medium",
        details: {
          business_id: businessId,
          offer_id: offerId,
          match_field: "email",
          lead_email: leadEmail,
          reason: "Same lead email already submitted to this business in last 30 days",
        },
      };
    }
  }

  // Check by phone
  if (leadPhone) {
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("lead_phone", leadPhone)
      .gte("submitted_at", thirtyDaysAgo);

    if (count && count > 0) {
      return {
        type: "duplicate_lead",
        severity: "medium",
        details: {
          business_id: businessId,
          offer_id: offerId,
          match_field: "phone",
          lead_phone: leadPhone,
          reason: "Same lead phone already submitted to this business in last 30 days",
        },
      };
    }
  }

  return null;
}

/**
 * Log fraud signals to the database (admin client, bypasses RLS).
 */
async function logFraudSignals(
  userId: string,
  referralId: string | null,
  signals: FraudCheckResult["signals"]
) {
  const admin = createAdminClient();

  for (const signal of signals) {
    await admin.from("fraud_signals").insert({
      user_id: userId,
      referral_id: referralId,
      signal_type: signal.type,
      severity: signal.severity,
      details: signal.details,
    });
  }
}

/**
 * Admin: Get unresolved fraud signals.
 */
export async function getUnresolvedFraudSignals(limit = 50) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("fraud_signals")
    .select(
      `
      *,
      user:profiles(id, full_name, email),
      referral:referrals(id, lead_name, status)
    `
    )
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Admin: Resolve a fraud signal.
 */
export async function resolveFraudSignal(signalId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("fraud_signals")
    .update({ resolved: true })
    .eq("id", signalId);

  if (error) return { error: error.message };
  return { success: true };
}
