import { eq } from "drizzle-orm";

import { db } from "@/db";
import { whitelistEmail } from "@/db/schema";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isEmailWhitelisted(email: string) {
  const access = await getWhitelistAccess(email);

  return access?.status === "active";
}

export async function getWhitelistAccess(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const [entry] = await db
    .select({ role: whitelistEmail.role, status: whitelistEmail.status })
    .from(whitelistEmail)
    .where(eq(whitelistEmail.email, normalizedEmail))
    .limit(1);

  return entry;
}
