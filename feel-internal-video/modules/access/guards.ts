import { getCurrentAccess } from "@/modules/access/queries";

export async function requireActiveAccess() {
  const access = await getCurrentAccess();

  if (access.status === "anonymous") {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }

  if (!access.isActive) {
    return { ok: false as const, status: 403, message: "Access blocked" };
  }

  return { ok: true as const, access };
}

export async function requireAdminAccess() {
  const active = await requireActiveAccess();

  if (!active.ok) {
    return active;
  }

  if (!active.access.isAdmin) {
    return { ok: false as const, status: 403, message: "Admin only" };
  }

  return active;
}

export function accessError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}
