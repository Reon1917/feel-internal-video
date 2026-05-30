import { and, asc, count, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { category, video } from "@/db/schema";

export type CategoryRow = {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  videoCount: number;
  childCount: number;
};

export async function listCategories(): Promise<CategoryRow[]> {
  const [categories, videoCounts] = await Promise.all([
    db
      .select({
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
      })
      .from(category)
      .orderBy(asc(category.sortOrder), asc(category.name)),
    db
      .select({
        categoryId: video.categoryId,
        count: count(video.id),
      })
      .from(video)
      .where(ne(video.status, "deleted"))
      .groupBy(video.categoryId),
  ]);

  const videoCountByCategory = new Map(
    videoCounts.map((row) => [row.categoryId, Number(row.count)]),
  );
  const childCountByParent = new Map<string, number>();

  for (const item of categories) {
    if (!item.parentId) {
      continue;
    }

    childCountByParent.set(
      item.parentId,
      (childCountByParent.get(item.parentId) ?? 0) + 1,
    );
  }

  return categories.map((item) => ({
    ...item,
    videoCount: videoCountByCategory.get(item.id) ?? 0,
    childCount: childCountByParent.get(item.id) ?? 0,
  }));
}

export async function getCategoryById(id: string) {
  const [entry] = await db
    .select({ id: category.id })
    .from(category)
    .where(eq(category.id, id))
    .limit(1);

  return entry ?? null;
}

export async function createCategory(input: {
  name: string;
  parentId?: string | null;
  sortOrder?: number;
  adminId: string;
}) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Category name is required.");
  }

  const [entry] = await db
    .insert(category)
    .values({
      name,
      parentId: input.parentId || null,
      sortOrder: input.sortOrder ?? 0,
      createdByAdminId: input.adminId,
      updatedAt: new Date(),
    })
    .returning();

  return entry;
}

export async function updateCategory(input: {
  id: string;
  name?: string;
  parentId?: string | null;
  sortOrder?: number;
}) {
  const updates: Partial<typeof category.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Category name is required.");
    }

    updates.name = name;
  }

  if (input.parentId !== undefined) {
    if (input.parentId === input.id) {
      throw new Error("A category cannot be its own parent.");
    }

    updates.parentId = input.parentId || null;
  }

  if (input.sortOrder !== undefined) {
    updates.sortOrder = input.sortOrder;
  }

  const [entry] = await db
    .update(category)
    .set(updates)
    .where(eq(category.id, input.id))
    .returning();

  return entry ?? null;
}

export async function deleteCategory(id: string) {
  const [[children], [videos]] = await Promise.all([
    db
      .select({ count: count(category.id) })
      .from(category)
      .where(eq(category.parentId, id)),
    db
      .select({ count: count(video.id) })
      .from(video)
      .where(and(eq(video.categoryId, id), ne(video.status, "deleted"))),
  ]);

  if (Number(children?.count ?? 0) > 0 || Number(videos?.count ?? 0) > 0) {
    throw new Error("Category is not empty.");
  }

  const [entry] = await db
    .delete(category)
    .where(eq(category.id, id))
    .returning();

  return entry ?? null;
}
