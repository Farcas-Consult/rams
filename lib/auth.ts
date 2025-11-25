import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/db";
import { sendResetPasswordEmail } from "@/lib/email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!user.email) {
        console.warn(
          "[better-auth] Attempted to send reset email without a user email"
        );
        return;
      }

      await sendResetPasswordEmail({
        to: user.email,
        url,
        name: user.name,
      });
    },
  },
  plugins: [
    openAPI(), 
  ],
  trustedOrigins: [
    "http://localhost:3000",
    'http://192.168.8.5:3000'
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
  }),
});
