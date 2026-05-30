import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { category, video } from "@/db/schema";
import {
  buildBunnyPlayerUrl,
  getBunnyVideoPlayData,
} from "@/modules/videos/bunny";

export type VideoStatus = "processing" | "ready" | "failed" | "deleted";

type DbVideoRow = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  categoryName: string | null;
  bunnyLibraryId: string;
  bunnyVideoId: string;
  thumbnailUrl: string | null;
  duration: number | null;
  status: VideoStatus;
  createdAt: Date;
  updatedAt: Date;
  encodeProgress?: number | null;
};

export type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  bunnyLibraryId: string;
  bunnyVideoId: string;
  playerUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  status: VideoStatus;
  encodeProgress: number | null;
  createdAt: string;
  updatedAt: string;
};

function mapVideoRow(row: DbVideoRow): VideoRow {
  return {
    ...row,
    categoryName: row.categoryName ?? "Uncategorized",
    encodeProgress: row.encodeProgress ?? null,
    playerUrl: buildBunnyPlayerUrl({
      libraryId: row.bunnyLibraryId,
      videoId: row.bunnyVideoId,
    }),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function syncBunnyVideoRows(rows: DbVideoRow[]) {
  const syncedRows = await Promise.all(
    rows.map(async (row) => {
      if (
        row.status === "deleted" ||
        (row.status === "ready" && row.thumbnailUrl && row.duration)
      ) {
        return row;
      }

      try {
        const bunnyVideo = await getBunnyVideoPlayData({
          libraryId: row.bunnyLibraryId,
          videoId: row.bunnyVideoId,
        });
        const nextRow: DbVideoRow = {
          ...row,
          status: bunnyVideo.status,
          thumbnailUrl: bunnyVideo.thumbnailUrl ?? row.thumbnailUrl,
          duration: bunnyVideo.duration ?? row.duration,
          encodeProgress: bunnyVideo.encodeProgress,
        };

        if (
          nextRow.status !== row.status ||
          nextRow.thumbnailUrl !== row.thumbnailUrl ||
          nextRow.duration !== row.duration
        ) {
          await db
            .update(video)
            .set({
              status: nextRow.status,
              thumbnailUrl: nextRow.thumbnailUrl,
              duration: nextRow.duration,
              updatedAt: new Date(),
            })
            .where(eq(video.id, row.id));
        }

        return nextRow;
      } catch {
        return row;
      }
    }),
  );

  return syncedRows;
}

async function selectVideoRows(input?: { includeDeleted?: boolean }) {
  const where = [];

  if (!input?.includeDeleted) {
    where.push(ne(video.status, "deleted"));
  }

  return db
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      categoryId: video.categoryId,
      categoryName: category.name,
      bunnyLibraryId: video.bunnyLibraryId,
      bunnyVideoId: video.bunnyVideoId,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      status: video.status,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    })
    .from(video)
    .leftJoin(category, eq(category.id, video.categoryId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(video.createdAt), asc(video.title));
}

export async function listVideos(input?: {
  readyOnly?: boolean;
  includeDeleted?: boolean;
  syncWithBunny?: boolean;
}) {
  const rows = await selectVideoRows({ includeDeleted: input?.includeDeleted });
  const syncedRows = input?.syncWithBunny
    ? await syncBunnyVideoRows(rows)
    : rows;
  const filteredRows = input?.readyOnly
    ? syncedRows.filter((row) => row.status === "ready")
    : syncedRows;

  return filteredRows.map(mapVideoRow);
}

export async function getVideoById(id: string) {
  const [row] = await db
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      categoryId: video.categoryId,
      categoryName: category.name,
      bunnyLibraryId: video.bunnyLibraryId,
      bunnyVideoId: video.bunnyVideoId,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      status: video.status,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    })
    .from(video)
    .leftJoin(category, eq(category.id, video.categoryId))
    .where(eq(video.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const [syncedRow] = await syncBunnyVideoRows([row]);

  return syncedRow ? mapVideoRow(syncedRow) : null;
}

export async function createVideoRecord(input: {
  title: string;
  description?: string | null;
  categoryId: string;
  bunnyLibraryId: string;
  bunnyVideoId: string;
  uploadedByAdminId: string;
}) {
  const [entry] = await db
    .insert(video)
    .values({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      categoryId: input.categoryId,
      bunnyLibraryId: input.bunnyLibraryId,
      bunnyVideoId: input.bunnyVideoId,
      uploadedByAdminId: input.uploadedByAdminId,
      status: "processing",
      updatedAt: new Date(),
    })
    .returning();

  return entry;
}

export async function updateVideo(input: {
  id: string;
  title?: string;
  description?: string | null;
  categoryId?: string;
}) {
  const updates: Partial<typeof video.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();

    if (!title) {
      throw new Error("Video title is required.");
    }

    updates.title = title;
  }

  if (input.description !== undefined) {
    updates.description = input.description?.trim() || null;
  }

  if (input.categoryId !== undefined) {
    updates.categoryId = input.categoryId;
  }

  const [entry] = await db
    .update(video)
    .set(updates)
    .where(eq(video.id, input.id))
    .returning();

  return entry ?? null;
}

export async function softDeleteVideo(id: string) {
  const [entry] = await db
    .update(video)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(eq(video.id, id))
    .returning();

  return entry ?? null;
}
