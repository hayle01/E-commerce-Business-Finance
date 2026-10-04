type PasswordResetEmail = {
  to: string;
  url: string;
};

/**
 * Transactional email for password reset.
 *
 * Supported free providers (pick one):
 * - Resend (https://resend.com): RESEND_API_KEY + RESEND_FROM_EMAIL.
 *   Without a verified custom domain, use RESEND_FROM_EMAIL="onboarding@resend.dev"
 *   which can only deliver to the Resend account owner's address.
 * - Brevo (https://www.brevo.com): BREVO_API_KEY + BREVO_FROM_EMAIL.
 *   Free tier (300/day); verify your own email address as sender — no domain needed.
 *
 * In development without keys, the reset URL is logged to the server console.
 * In production without keys, we log an explicit error (no silent success).
 */
export async function sendPasswordResetEmail({ to, url }: PasswordResetEmail): Promise<void> {
  const subject = "Reset your password";
  const html = `<p>You requested a password reset.</p><p><a href="${url}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`;

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;
  if (resendKey && resendFrom) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: resendFrom, to: [to], subject, html }),
    });
    if (!res.ok) console.error(`[mailer] Resend delivery failed with status ${res.status}`);
    return;
  }

  const brevoKey = process.env.BREVO_API_KEY;
  const brevoFrom = process.env.BREVO_FROM_EMAIL;
  const brevoName = process.env.BREVO_FROM_NAME;
  if (brevoKey && brevoFrom) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: brevoName ?? "Commerce & Finance", email: brevoFrom },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) console.error(`[mailer] Brevo delivery failed with status ${res.status}`);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`[mailer] Password reset requested for ${to}. Reset URL: ${url}`);
    return;
  }
  console.error("[mailer] No email provider configured (RESEND_* or BREVO_*); reset email not sent.");
}
