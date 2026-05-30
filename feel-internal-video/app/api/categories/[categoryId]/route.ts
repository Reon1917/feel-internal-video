import {
  accessError,
  requireAdminAccess,
} from "@/modules/access/guards";
import {
  deleteCategory,
  updateCategory,
} from "@/modules/categories/queries";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  const { categoryId } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const category = await updateCategory({
      id: categoryId,
      name: typeof body?.name === "string" ? body.name : undefined,
      parentId:
        typeof body?.parentId === "string" && body.parentId !== "root"
          ? body.parentId
          : body?.parentId === null || body?.parentId === "root"
            ? null
            : undefined,
      sortOrder:
        typeof body?.sortOrder === "number" ? body.sortOrder : undefined,
    });

    if (!category) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }

    return Response.json({ category });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Category failed." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  const { categoryId } = await context.params;

  try {
    const category = await deleteCategory(categoryId);

    if (!category) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }

    return Response.json({ category });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Category failed." },
      { status: 400 },
    );
  }
}
