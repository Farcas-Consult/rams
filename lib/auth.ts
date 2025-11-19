import { betterAuth } from "better-auth";
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
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
  }),
});
