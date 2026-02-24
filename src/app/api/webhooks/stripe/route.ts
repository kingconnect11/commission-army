/**
 * Stripe Webhook Handler
 *
 * Handles payment events for the referral escrow flow:
 * 1. payment_intent.succeeded — Fee captured, start escrow hold
 * 2. account.updated — Stripe Connect onboarding status changes
 * 3. transfer.created — Payout to referrer confirmed
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPaymentReceivedEmail } from "@/lib/email";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const referralId = paymentIntent.metadata?.referral_id;

        if (referralId) {
          await supabase
            .from("referrals")
            .update({
              stripe_payment_intent_id: paymentIntent.id,
              status: "accepted",
              accepted_at: new Date().toISOString(),
            })
            .eq("id", referralId);

          const { data: referral } = await supabase
            .from("referrals")
            .select("referrer_id, referrer_payout, offer_id")
            .eq("id", referralId)
            .single();

          if (referral) {
            await supabase.from("notifications").insert({
              user_id: referral.referrer_id,
              type: "payment_received",
              title: "Payment Processing",
              body: `$${referral.referrer_payout} is being held in escrow and will be released in 7 days.`,
              data: { referral_id: referralId },
            });
          }
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        if (account.charges_enabled && account.payouts_enabled) {
          await supabase
            .from("profiles")
            .update({ stripe_onboarding_complete: true })
            .eq("stripe_account_id", account.id);
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        const referralId = transfer.metadata?.referral_id;

        if (referralId) {
          await supabase
            .from("referrals")
            .update({
              stripe_transfer_id: transfer.id,
              escrow_released_at: new Date().toISOString(),
            })
            .eq("id", referralId);

          const { data: referral } = await supabase
            .from("referrals")
            .select(`
              referrer_id, referrer_payout, lead_name,
              referrer:profiles!referrals_referrer_id_fkey(email, full_name),
              business:businesses(name)
            `)
            .eq("id", referralId)
            .single();

          if (referral) {
            await supabase.from("notifications").insert({
              user_id: referral.referrer_id,
              type: "payment_sent",
              title: "Payment Released!",
              body: `$${referral.referrer_payout} has been transferred to your account.`,
              data: { referral_id: referralId },
            });

            // Send payment email to referrer
            const r = referral as Record<string, unknown>;
            const referrerProfile = r.referrer as Record<string, string> | null;
            const bizProfile = r.business as Record<string, string> | null;
            if (referrerProfile?.email && referral.referrer_payout) {
              void sendPaymentReceivedEmail(referrerProfile.email, {
                referrerName: referrerProfile.full_name ?? "there",
                amount: Number(referral.referrer_payout),
                businessName: bizProfile?.name ?? "the business",
                leadName: (r.lead_name as string) ?? "your referral",
              });
            }
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
