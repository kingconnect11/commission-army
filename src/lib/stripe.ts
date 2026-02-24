/**
 * Stripe helpers for Commission Army
 *
 * Handles:
 * - Connect account creation (Express)
 * - Onboarding link generation
 * - Payment intent creation (escrow)
 * - Transfers to referrers (payout)
 */
import Stripe from "stripe";

const PLATFORM_FEE_PERCENT = 0.20; // 20%

/**
 * Lazy Stripe singleton. Only initializes when actually called,
 * so Next.js build doesn't crash when STRIPE_SECRET_KEY isn't set.
 */
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Create a Stripe Connect Express account for a user.
 */
export async function createConnectAccount(email: string): Promise<string> {
  const account = await getStripe().accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      platform: "commission_army",
    },
  });
  return account.id;
}

/**
 * Generate an onboarding link for a Connect account.
 */
export async function createOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const link = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

/**
 * Create a payment intent for a referral fee (held in escrow on platform).
 * The business pays; we hold the funds, then transfer to referrer after escrow.
 */
export async function createReferralPayment(params: {
  amount: number; // Total fee in dollars (e.g., 100.00)
  businessStripeAccountId: string; // Business paying
  referralId: string;
  description: string;
}): Promise<Stripe.PaymentIntent> {
  const amountInCents = Math.round(params.amount * 100);

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    description: params.description,
    metadata: {
      referral_id: params.referralId,
      platform: "commission_army",
    },
  });

  return paymentIntent;
}

/**
 * Transfer referrer's share to their Connect account after escrow clears.
 */
export async function transferToReferrer(params: {
  amount: number; // Referrer's 80% share in dollars
  referrerStripeAccountId: string;
  referralId: string;
}): Promise<Stripe.Transfer> {
  const amountInCents = Math.round(params.amount * 100);

  const transfer = await getStripe().transfers.create({
    amount: amountInCents,
    currency: "usd",
    destination: params.referrerStripeAccountId,
    metadata: {
      referral_id: params.referralId,
      platform: "commission_army",
    },
  });

  return transfer;
}

/**
 * Calculate the fee split for a referral.
 */
export function calculateFeeSplit(totalFee: number): {
  platformFee: number;
  referrerPayout: number;
} {
  const platformFee = Math.round(totalFee * PLATFORM_FEE_PERCENT * 100) / 100;
  const referrerPayout = Math.round((totalFee - platformFee) * 100) / 100;
  return { platformFee, referrerPayout };
}

/**
 * Check if a Connect account has completed onboarding.
 */
export async function checkAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  const account = await getStripe().accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  };
}
