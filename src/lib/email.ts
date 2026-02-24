/**
 * Commission Army email sending utility (Resend)
 *
 * All sends are fire-and-forget: failures are logged but never throw.
 * This ensures email issues never break the main action flow.
 */

import { Resend } from "resend";
import {
  newReferralEmail,
  referralAcceptedEmail,
  referralRejectedEmail,
  paymentReceivedEmail,
  type NewReferralEmailData,
  type ReferralAcceptedEmailData,
  type ReferralRejectedEmailData,
  type PaymentReceivedEmailData,
} from "./email-templates";

const FROM_ADDRESS = "Commission Army <noreply@commissionarmy.com>";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
    }
  } catch (err) {
    console.error("[email] Failed to send email:", err);
  }
}

// ─── Higher-level helpers ──────────────────────────────────────────────────────

export async function sendNewReferralEmail(
  to: string,
  data: NewReferralEmailData
): Promise<void> {
  const { subject, html } = newReferralEmail(data);
  await sendEmail(to, subject, html);
}

export async function sendReferralAcceptedEmail(
  to: string,
  data: ReferralAcceptedEmailData
): Promise<void> {
  const { subject, html } = referralAcceptedEmail(data);
  await sendEmail(to, subject, html);
}

export async function sendReferralRejectedEmail(
  to: string,
  data: ReferralRejectedEmailData
): Promise<void> {
  const { subject, html } = referralRejectedEmail(data);
  await sendEmail(to, subject, html);
}

export async function sendPaymentReceivedEmail(
  to: string,
  data: PaymentReceivedEmailData
): Promise<void> {
  const { subject, html } = paymentReceivedEmail(data);
  await sendEmail(to, subject, html);
}
