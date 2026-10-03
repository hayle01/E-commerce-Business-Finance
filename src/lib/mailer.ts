type PasswordResetEmail = {
  to: string;
  url: string;
};

/**
 * Sends transactional email. No provider is configured in v1 development,
 * so the reset link is logged to the server console in development only.
 * Wire a real provider (SMTP/Resend/etc.) here before production launch.
 */
export async function sendPasswordResetEmail({
  to,
  url,
}: PasswordResetEmail): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info(`[mailer] Password reset requested for ${to}. Reset URL: ${url}`);
    return;
  }
  // TODO: integrate a transactional email provider before production launch.
  console.error("[mailer] No email provider configured; password reset email not sent.");
}
