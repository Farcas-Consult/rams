import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

const resend =
  resendApiKey && resendApiKey.length > 0 ? new Resend(resendApiKey) : null;

type ResetPasswordPayload = {
  to: string;
  url: string;
  name?: string | null;
};

export async function sendResetPasswordEmail({
  to,
  url,
  name,
}: ResetPasswordPayload) {
  if (!to) {
    console.warn("[email] Attempted to send reset link without a recipient");
    return;
  }

  if (!resend || !resendFromEmail) {
    console.info(
      `[email] RESEND_API_KEY or RESEND_FROM_EMAIL missing. Provide both env vars to deliver email. Password reset URL for ${to}: ${url}`
    );
    return;
  }

  const previewText = "Reset your RAMS account password";
  const safeName = name || "there";

  try {
    await resend.emails.send({
      from: resendFromEmail,
      to,
      subject: "Reset your RAMS password",
      headers: {
        "X-Entity-Ref-ID": "rams-reset-password",
      },
      text: [
        `Hi ${safeName},`,
        "",
        "Use the secure link below to reset your RAMS password:",
        url,
        "",
        "If you didn’t request this change you can ignore this email.",
        "",
        "— RAMS Security",
      ].join("\n"),
      html: `
        <p>Hi ${safeName},</p>
        <p>Use the secure link below to reset your RAMS password:</p>
        <p><a href="${url}" target="_blank" rel="noopener noreferrer">Reset password</a></p>
        <p>If you didn’t request this change you can ignore this email.</p>
        <p>— RAMS Security</p>
      `,
    });
  } catch (error) {
    console.error("[email] Failed to send reset password email", error);
    throw error;
  }
}

