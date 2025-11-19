import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

const resend =
  resendApiKey && resendApiKey.length > 0 ? new Resend(resendApiKey) : null;

const appBaseUrl =
  process.env.APP_URL ||
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

type ResetPasswordPayload = {
  to: string;
  url: string;
  name?: string | null;
};

type UserInvitePayload = {
  to: string;
  token: string;
  inviter: string;
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

export async function sendUserInviteEmail({
  to,
  token,
  inviter,
  name,
}: UserInvitePayload) {
  if (!to || !token) {
    console.warn("[email] Missing recipient or token for invite.");
    return;
  }

  const inviteUrl = buildInviteUrl(token);
  const previewText = "You’ve been invited to RAMS";
  const safeName = name || "there";

  if (!resend || !resendFromEmail) {
    console.info(
      `[email] RESEND_API_KEY or RESEND_FROM_EMAIL missing. Provide both env vars to deliver email.\nInvite link for ${to}: ${inviteUrl}`
    );
    return;
  }

  try {
    await resend.emails.send({
      from: resendFromEmail,
      to,
      subject: "You're invited to RAMS",
      headers: {
        "X-Entity-Ref-ID": "rams-user-invite",
      },
      text: [
        `Hi ${safeName},`,
        "",
        `${inviter} invited you to the RAMS dashboard.`,
        "Use the secure link below to activate your account and set a password:",
        inviteUrl,
        "",
        "This link expires in 7 days. If it stops working, ask your admin to resend the invite.",
        "",
        "— RAMS Team",
      ].join("\n"),
      html: `
        <p>Hi ${safeName},</p>
        <p><strong>${inviter}</strong> invited you to the RAMS dashboard.</p>
        <p>Use the secure link below to activate your account and set a password:</p>
        <p><a href="${inviteUrl}" target="_blank" rel="noopener noreferrer">Accept invitation</a></p>
        <p>This link expires in 7 days. If it stops working, ask your admin to resend the invite.</p>
        <p>— RAMS Team</p>
      `,
    });
  } catch (error) {
    console.error("[email] Failed to send user invite email", error);
    throw error;
  }
}

function buildInviteUrl(token: string) {
  const trimmed = appBaseUrl.replace(/\/$/, "");
  const url = new URL(`${trimmed}/auth/accept-invite`);
  url.searchParams.set("token", token);
  return url.toString();
}

