import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { session, user, whitelistEmail } from "@/db/schema";
import { normalizeEmail } from "@/lib/auth-utils";

type WhitelistRole = "admin" | "user";

export async function listWhitelistEmails() {
  return db
    .select({
      id: whitelistEmail.id,
      email: whitelistEmail.email,
      role: whitelistEmail.role,
      status: whitelistEmail.status,
      note: whitelistEmail.note,
      createdAt: whitelistEmail.createdAt,
      revokedAt: whitelistEmail.revokedAt,
    })
    .from(whitelistEmail)
    .orderBy(desc(whitelistEmail.createdAt));
}

export async function upsertWhitelistEmail(input: {
  email: string;
  role?: WhitelistRole;
  note?: string | null;
  adminId: string;
}) {
  const email = normalizeEmail(input.email);
  const role = input.role ?? "user";

  const [entry] = await db
    .insert(whitelistEmail)
    .values({
      email,
      role,
      status: "active",
      note: input.note,
      addedByAdminId: input.adminId,
      revokedAt: null,
      revokedByAdminId: null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: whitelistEmail.email,
      set: {
        role,
        status: "active",
        note: input.note,
        addedByAdminId: input.adminId,
        revokedAt: null,
        revokedByAdminId: null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return entry;
}

export async function revokeWhitelistEmail(input: {
  email: string;
  adminId: string;
  note?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const now = new Date();

  const [entry] = await db
    .update(whitelistEmail)
    .set({
      status: "revoked",
      revokedAt: now,
      revokedByAdminId: input.adminId,
      note: input.note,
      updatedAt: now,
    })
    .where(eq(whitelistEmail.email, email))
    .returning();

  const [revokedUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (revokedUser) {
    await db.delete(session).where(eq(session.userId, revokedUser.id));
  }

  return entry ?? null;
}
