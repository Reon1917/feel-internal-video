import { NextResponse } from "next/server";

import { getCurrentAccess } from "@/modules/access/queries";
import {
  listWhitelistEmails,
  revokeWhitelistEmail,
  upsertWhitelistEmail,
} from "@/modules/whitelist/queries";

function forbidden(message = "Admin access required.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

async function requireAdmin() {
  const access = await getCurrentAccess();

  if (access.status === "anonymous") {
    return {
      access,
      response: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }

  if (!access.isAdmin) {
    return {
      access,
      response: forbidden(
        access.isActive ? "Admin role required." : "Whitelist access is inactive.",
      ),
    };
  }

  return { access, response: null };
}

export async function GET() {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  return NextResponse.json({ data: await listWhitelistEmails() });
}

export async function POST(request: Request) {
  const { access, response } = await requireAdmin();

  if (response) {
    return response;
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    role?: unknown;
    note?: unknown;
  } | null;

  if (!body || typeof body.email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const role = body.role === "admin" ? "admin" : "user";
  const note = typeof body.note === "string" ? body.note : null;

  const entry = await upsertWhitelistEmail({
    email: body.email,
    role,
    note,
    adminId: access.user.id,
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { access, response } = await requireAdmin();

  if (response) {
    return response;
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    note?: unknown;
  } | null;

  if (!body || typeof body.email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note : null;
  const entry = await revokeWhitelistEmail({
    email: body.email,
    note,
    adminId: access.user.id,
  });

  if (!entry) {
    return NextResponse.json({ error: "Whitelist entry not found." }, { status: 404 });
  }

  return NextResponse.json({ data: entry });
}
