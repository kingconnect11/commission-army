/**
 * Commission Army email templates
 * All templates use inline CSS for maximum email client compatibility.
 * Design: Dark navy background, white text, crimson accents.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://commissionarmy.com";

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Commission Army</title>
</head>
<body style="margin:0;padding:0;background-color:#060D1B;font-family:'DM Sans',Arial,sans-serif;color:#F1F3F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060D1B;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <!-- Logo Header -->
          <tr>
            <td style="padding-bottom:28px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#A52422;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;font-weight:700;font-size:14px;color:#fff;letter-spacing:0.5px;">
                    CA
                  </td>
                  <td style="padding-left:10px;font-size:14px;font-weight:600;color:#F1F3F5;letter-spacing:1px;">
                    COMMISSION ARMY
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#0A1628;border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;font-size:11px;color:#6B7280;">
              You're receiving this because you have an account on Commission Army.<br />
              <a href="${BASE_URL}" style="color:#6B7280;text-decoration:underline;">commissionarmy.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:#A52422;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:24px;">${label}</a>`;
}

function divider(): string {
  return `<tr><td style="padding:20px 0;"><hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);" /></td></tr>`;
}

// ─── Template: New Referral Submitted (to Business) ───────────────────────────

export interface NewReferralEmailData {
  businessName: string;
  offerTitle: string;
  referrerName: string;
  leadName: string;
  leadContext: string;
  referralId: string;
}

export function newReferralEmail(data: NewReferralEmailData): { subject: string; html: string } {
  const subject = `New referral received for "${data.offerTitle}"`;
  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:8px;">
          <span style="display:inline-block;background-color:rgba(165,36,34,0.15);color:#DC4D4D;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;border:1px solid rgba(165,36,34,0.3);letter-spacing:0.5px;text-transform:uppercase;">New Referral</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#F1F3F5;line-height:1.3;">You have a new referral</h1>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;font-size:14px;color:#9CA3AF;line-height:1.6;">
          Someone submitted a referral for your offer <strong style="color:#F1F3F5;">${data.offerTitle}</strong>.
        </td>
      </tr>
      ${divider()}
      <tr>
        <td style="padding-bottom:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Referred by</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#F1F3F5;">${data.referrerName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Lead name</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#F1F3F5;">${data.leadName}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Context</p>
                <p style="margin:0;font-size:14px;color:#9CA3AF;line-height:1.5;background-color:rgba(255,255,255,0.04);padding:12px;border-radius:8px;">${data.leadContext}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${divider()}
      <tr>
        <td style="font-size:14px;color:#9CA3AF;">
          Review this referral and accept or reject it in your dashboard.
          ${ctaButton(`${BASE_URL}/dashboard/incoming`, "Review Referral")}
        </td>
      </tr>
    </table>
  `);
  return { subject, html };
}

// ─── Template: Referral Accepted (to Referrer) ────────────────────────────────

export interface ReferralAcceptedEmailData {
  referrerName: string;
  businessName: string;
  offerTitle: string;
  leadName: string;
  feeDescription: string;
}

export function referralAcceptedEmail(data: ReferralAcceptedEmailData): { subject: string; html: string } {
  const subject = `${data.businessName} accepted your referral!`;
  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:8px;">
          <span style="display:inline-block;background-color:rgba(45,138,78,0.15);color:#4CC283;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;border:1px solid rgba(45,138,78,0.3);letter-spacing:0.5px;text-transform:uppercase;">Accepted</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#F1F3F5;line-height:1.3;">Your referral was accepted!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;font-size:14px;color:#9CA3AF;line-height:1.6;">
          Great news, ${data.referrerName}. <strong style="color:#F1F3F5;">${data.businessName}</strong> accepted your referral for <strong style="color:#F1F3F5;">${data.leadName}</strong>.
        </td>
      </tr>
      ${divider()}
      <tr>
        <td style="padding-bottom:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Offer</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#F1F3F5;">${data.offerTitle}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Commission</p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#4CC283;">${data.feeDescription}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${divider()}
      <tr>
        <td style="font-size:14px;color:#9CA3AF;">
          You can track your referral status and message the business in your dashboard.
          ${ctaButton(`${BASE_URL}/dashboard/my-referrals`, "View My Referrals")}
        </td>
      </tr>
    </table>
  `);
  return { subject, html };
}

// ─── Template: Referral Rejected (to Referrer) ────────────────────────────────

export interface ReferralRejectedEmailData {
  referrerName: string;
  businessName: string;
  leadName: string;
}

export function referralRejectedEmail(data: ReferralRejectedEmailData): { subject: string; html: string } {
  const subject = `Update on your referral to ${data.businessName}`;
  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#F1F3F5;line-height:1.3;">Referral not accepted</h1>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;font-size:14px;color:#9CA3AF;line-height:1.6;">
          Hi ${data.referrerName}, unfortunately <strong style="color:#F1F3F5;">${data.businessName}</strong> was not able to accept your referral for <strong style="color:#F1F3F5;">${data.leadName}</strong> at this time.
        </td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#9CA3AF;line-height:1.6;">
          Don't be discouraged — there are plenty of other offers to explore. Keep submitting and earning!
          ${ctaButton(`${BASE_URL}/dashboard/offers`, "Browse More Offers")}
        </td>
      </tr>
    </table>
  `);
  return { subject, html };
}

// ─── Template: Payment Received (to Referrer) ─────────────────────────────────

export interface PaymentReceivedEmailData {
  referrerName: string;
  amount: number;
  businessName: string;
  leadName: string;
}

export function paymentReceivedEmail(data: PaymentReceivedEmailData): { subject: string; html: string } {
  const formattedAmount = `$${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const subject = `You earned ${formattedAmount} from your referral!`;
  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:8px;">
          <span style="display:inline-block;background-color:rgba(45,138,78,0.15);color:#4CC283;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;border:1px solid rgba(45,138,78,0.3);letter-spacing:0.5px;text-transform:uppercase;">Payment Sent</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#F1F3F5;line-height:1.3;">You just got paid!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;font-size:14px;color:#9CA3AF;line-height:1.6;">
          Congratulations, ${data.referrerName}! Your commission from <strong style="color:#F1F3F5;">${data.businessName}</strong> for referring <strong style="color:#F1F3F5;">${data.leadName}</strong> has been sent.
        </td>
      </tr>
      ${divider()}
      <tr>
        <td style="padding:20px 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Amount Earned</p>
          <p style="margin:0;font-size:36px;font-weight:700;color:#4CC283;">${formattedAmount}</p>
        </td>
      </tr>
      ${divider()}
      <tr>
        <td style="font-size:14px;color:#9CA3AF;">
          Funds will appear in your connected bank account within 2-3 business days.
          ${ctaButton(`${BASE_URL}/dashboard`, "View Dashboard")}
        </td>
      </tr>
    </table>
  `);
  return { subject, html };
}
