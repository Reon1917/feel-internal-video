import {
  accessError,
  requireActiveAccess,
  requireAdminAccess,
} from "@/modules/access/guards";
import {
  createCategory,
  listCategories,
} from "@/modules/categories/queries";

export async function GET() {
  const auth = await requireActiveAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  return Response.json({ categories: await listCategories() });
}

export async function POST(request: Request) {
  const auth = await requireAdminAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  const parentId =
    typeof body?.parentId === "string" && body.parentId !== "root"
      ? body.parentId
      : null;

  try {
    const category = await createCategory({
      name,
      parentId,
      adminId: auth.access.user.id,
    });

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Category failed." },
      { status: 400 },
    );
  }
}
