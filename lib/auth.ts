import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db, schema } from "@/db";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(
          `[better-auth] Password reset requested for ${user.email ?? user.id}: ${url}`
        );
      }
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
  }),
});
