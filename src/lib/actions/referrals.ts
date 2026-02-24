"use server";

import { createClient } from "@/lib/supabase/server";
import { runFraudChecks } from "@/lib/actions/fraud";
import {
  sendNewReferralEmail,
  sendReferralAcceptedEmail,
  sendReferralRejectedEmail,
} from "@/lib/email";
import { feeDisplay } from "@/lib/utils";
import type { ReferralInsert, ReferralWithDetails } from "@/types";

export async function submitReferral(data: ReferralInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the offer exists and is active
  const { data: offer } = await supabase
    .from("offers")
    .select("id, business_id, is_active")
    .eq("id", data.offer_id)
    .single();

  if (!offer || !offer.is_active) {
    return { error: "This offer is no longer active" };
  }

  // Run fraud detection checks
  const fraudResult = await runFraudChecks(
    user.id,
    offer.business_id,
    data.lead_email ?? null,
    data.lead_phone ?? null,
    data.offer_id
  );

  if (!fraudResult.passed) {
    return { error: "This referral could not be submitted. Please contact support." };
  }

  const { data: referral, error } = await supabase
    .from("referrals")
    .insert({
      ...data,
      referrer_id: user.id,
      business_id: offer.business_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Fire-and-forget: notify business owner of new referral
  void (async () => {
    try {
      const [{ data: offerDetails }, { data: referrerProfile }] = await Promise.all([
        supabase
          .from("offers")
          .select("title, fee_type, flat_fee, percentage_fee, businesses(owner_id, profiles(email, full_name))")
          .eq("id", data.offer_id)
          .single(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single(),
      ]);

      const offerAny = offerDetails as Record<string, unknown> | null;
      const business = offerAny?.businesses as Record<string, unknown> | null;
      const ownerProfile = business?.profiles as Record<string, string> | null;
      const ownerEmail = ownerProfile?.email;

      if (ownerEmail) {
        await sendNewReferralEmail(ownerEmail, {
          businessName: (business?.name as string) ?? "your business",
          offerTitle: (offerAny?.title as string) ?? "your offer",
          referrerName: (referrerProfile as Record<string, string> | null)?.full_name ?? "A user",
          leadName: data.lead_name,
          leadContext: data.lead_context ?? "",
          referralId: referral.id,
        });
      }
    } catch (e) {
      console.error("[submitReferral] email error:", e);
    }
  })();

  return { data: referral };
}

export async function getMyReferrals(role: "referrer" | "business") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  if (role === "referrer") {
    const { data } = await supabase
      .from("referrals")
      .select(
        `
        *,
        offer:offers(id, title, fee_type, flat_fee, percentage_fee),
        business:businesses(id, name, category, city, state)
      `
      )
      .eq("referrer_id", user.id)
      .order("submitted_at", { ascending: false });

    return (data as unknown as ReferralWithDetails[]) ?? [];
  }

  // Business role - get referrals sent to any business the user owns
  const { data } = await supabase
    .from("referrals")
    .select(
      `
      *,
      offer:offers(id, title, fee_type, flat_fee, percentage_fee),
      business:businesses!inner(id, name, category, city, state),
      referrer:profiles(id, full_name, avatar_url, rating_avg)
    `
    )
    .eq("businesses.owner_id", user.id)
    .order("submitted_at", { ascending: false });

  return (data as unknown as ReferralWithDetails[]) ?? [];
}

export async function updateReferralStatus(
  referralId: string,
  status: "accepted" | "rejected"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the user owns the business receiving this referral
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, business_id, status")
    .eq("id", referralId)
    .single();

  if (!referral) return { error: "Referral not found" };
  if (referral.status !== "submitted") {
    return { error: "This referral has already been processed" };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", referral.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Not authorized" };

  // Fetch full referral details needed for email before updating
  const { data: fullReferral } = await supabase
    .from("referrals")
    .select(`
      id, lead_name, fee_type, flat_fee, percentage_fee,
      referrer:profiles!referrals_referrer_id_fkey(email, full_name),
      offer:offers(title),
      business:businesses(name)
    `)
    .eq("id", referralId)
    .single();

  const updateData: Record<string, unknown> = {
    status,
    ...(status === "accepted"
      ? { accepted_at: new Date().toISOString() }
      : { rejected_at: new Date().toISOString() }),
  };

  const { error } = await supabase
    .from("referrals")
    .update(updateData)
    .eq("id", referralId);

  if (error) return { error: error.message };

  // Fire-and-forget: notify referrer
  if (fullReferral) {
    void (async () => {
      try {
        const r = fullReferral as Record<string, unknown>;
        const referrer = r.referrer as Record<string, string> | null;
        const offer = r.offer as Record<string, string> | null;
        const biz = r.business as Record<string, string> | null;
        const referrerEmail = referrer?.email;

        if (referrerEmail) {
          if (status === "accepted") {
            await sendReferralAcceptedEmail(referrerEmail, {
              referrerName: referrer?.full_name ?? "there",
              businessName: biz?.name ?? "The business",
              offerTitle: offer?.title ?? "the offer",
              leadName: r.lead_name as string,
              feeDescription: feeDisplay(
                r.fee_type as string,
                r.flat_fee as number | null,
                r.percentage_fee as number | null
              ),
            });
          } else {
            await sendReferralRejectedEmail(referrerEmail, {
              referrerName: referrer?.full_name ?? "there",
              businessName: biz?.name ?? "The business",
              leadName: r.lead_name as string,
            });
          }
        }
      } catch (e) {
        console.error("[updateReferralStatus] email error:", e);
      }
    })();
  }

  return { success: true };
}

export async function reportDealClosure(
  referralId: string,
  dealValue: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (dealValue <= 0) return { error: "Deal value must be positive" };

  const { data: referral } = await supabase
    .from("referrals")
    .select("id, business_id, status, percentage_fee")
    .eq("id", referralId)
    .single();

  if (!referral) return { error: "Referral not found" };
  if (referral.status !== "accepted") {
    return { error: "Referral must be accepted before reporting closure" };
  }
  if (!referral.percentage_fee) {
    return { error: "This referral has no percentage-based bonus" };
  }

  // deal_value triggers the calculate_success_bonus trigger in DB
  const { error } = await supabase
    .from("referrals")
    .update({
      deal_value: dealValue,
      status: "completed" as const,
      completed_at: new Date().toISOString(),
    })
    .eq("id", referralId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function submitReview(
  referralId: string,
  role: "business" | "referrer",
  rating: number,
  review: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (rating < 1 || rating > 5) return { error: "Rating must be 1-5" };

  const updateData =
    role === "business"
      ? {
          business_rating_of_referrer: rating,
          business_review_of_referrer: review,
        }
      : {
          referrer_rating_of_business: rating,
          referrer_review_of_business: review,
        };

  const { error } = await supabase
    .from("referrals")
    .update(updateData)
    .eq("id", referralId);

  if (error) return { error: error.message };

  // Update the recipient's average rating
  // For business reviewing referrer: update referrer's profile rating
  // For referrer reviewing business: update business owner's profile rating
  const { data: referral } = await supabase
    .from("referrals")
    .select("referrer_id, business_id")
    .eq("id", referralId)
    .single();

  if (referral) {
    const targetUserId =
      role === "business" ? referral.referrer_id : null;

    if (targetUserId) {
      // Recalculate average rating from all referrals
      const ratingField =
        role === "business"
          ? "business_rating_of_referrer"
          : "referrer_rating_of_business";
      const userField =
        role === "business" ? "referrer_id" : "business_id";

      // Use raw SQL via RPC for the aggregation
      const { data: ratings } = await supabase
        .from("referrals")
        .select(ratingField)
        .eq(userField, targetUserId)
        .not(ratingField, "is", null);

      if (ratings && ratings.length > 0) {
        const values = ratings.map(
          (r) => (r as Record<string, number>)[ratingField]
        );
        const avg =
          values.reduce((sum, v) => sum + v, 0) / values.length;

        await supabase
          .from("profiles")
          .update({
            rating_avg: Math.round(avg * 100) / 100,
            rating_count: values.length,
          })
          .eq("id", targetUserId);
      }
    }
  }

  return { success: true };
}
