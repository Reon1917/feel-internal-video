import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  getWhitelistAccess,
  isEmailWhitelisted,
  normalizeEmail,
} from "@/lib/auth-utils";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = normalizeEmail(user.email);
          const whitelistAccess = await getWhitelistAccess(email);

          if (whitelistAccess?.status !== "active") {
            return false;
          }

          return {
            data: {
              ...user,
              email,
              role: whitelistAccess.role,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const [user] = await db
            .select({ email: schema.user.email })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);

          if (!user || !(await isEmailWhitelisted(user.email))) {
            return false;
          }
        },
      },
    },
  },
});
