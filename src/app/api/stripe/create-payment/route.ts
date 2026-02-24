/**
 * POST /api/stripe/create-payment
 *
 * Creates a payment intent when a business accepts a referral.
 * The flat fee is charged to the business's payment method.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createReferralPayment } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referralId } = await request.json();

  if (!referralId) {
    return NextResponse.json(
      { error: "referralId is required" },
      { status: 400 }
    );
  }

  // Get the referral and verify the user owns the business
  const { data: referral } = await supabase
    .from("referrals")
    .select(
      `
      *,
      offer:offers(title),
      business:businesses!inner(id, name, owner_id)
    `
    )
    .eq("id", referralId)
    .single();

  if (!referral) {
    return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  }

  const business = referral.business as unknown as {
    id: string;
    name: string;
    owner_id: string;
  };

  if (business.owner_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (referral.status !== "submitted") {
    return NextResponse.json(
      { error: "Referral already processed" },
      { status: 400 }
    );
  }

  if (!referral.flat_fee_amount) {
    return NextResponse.json(
      { error: "No fee amount set" },
      { status: 400 }
    );
  }

  // Get business owner's Stripe account
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_onboarding_complete) {
    return NextResponse.json(
      { error: "Please complete Stripe onboarding first" },
      { status: 400 }
    );
  }

  const offer = referral.offer as unknown as { title: string };

  try {
    const paymentIntent = await createReferralPayment({
      amount: referral.flat_fee_amount,
      businessStripeAccountId: profile.stripe_account_id!,
      referralId,
      description: `Commission Army referral fee: ${offer.title} - ${referral.lead_name}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
