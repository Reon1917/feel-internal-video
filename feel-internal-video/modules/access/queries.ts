import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { user, whitelistEmail } from "@/db/schema";
import { auth } from "@/lib/auth";
import { normalizeEmail } from "@/lib/auth-utils";

export type CurrentAccess =
  | {
      status: "anonymous";
      session: null;
      user: null;
      isActive: false;
      isAdmin: false;
    }
  | {
      status: "authenticated";
      session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"];
      user: {
        id: string;
        email: string;
        name: string;
        role: "admin" | "user";
        whitelistStatus: "active" | "revoked" | null;
      };
      isActive: boolean;
      isAdmin: boolean;
    };

export async function getCurrentAccess(): Promise<CurrentAccess> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      status: "anonymous",
      session: null,
      user: null,
      isActive: false,
      isAdmin: false,
    };
  }

  const email = normalizeEmail(session.user.email);

  const [row] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      whitelistStatus: whitelistEmail.status,
    })
    .from(user)
    .leftJoin(whitelistEmail, eq(whitelistEmail.email, user.email))
    .where(eq(user.id, session.user.id))
    .limit(1);

  const userAccess = row ?? {
    id: session.user.id,
    email,
    name: session.user.name,
    role: "user" as const,
    whitelistStatus: null,
  };

  const isActive = userAccess.whitelistStatus === "active";
  const isAdmin = isActive && userAccess.role === "admin";

  return {
    status: "authenticated",
    session: session.session,
    user: {
      id: userAccess.id,
      email: normalizeEmail(userAccess.email),
      name: userAccess.name,
      role: userAccess.role,
      whitelistStatus: userAccess.whitelistStatus,
    },
    isActive,
    isAdmin,
  };
}
