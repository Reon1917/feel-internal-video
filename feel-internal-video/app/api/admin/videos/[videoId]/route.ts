import {
  accessError,
  requireAdminAccess,
} from "@/modules/access/guards";
import {
  softDeleteVideo,
  updateVideo,
} from "@/modules/videos/queries";

type RouteContext = {
  params: Promise<{ videoId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  const { videoId } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const video = await updateVideo({
      id: videoId,
      title: typeof body?.title === "string" ? body.title : undefined,
      description:
        typeof body?.description === "string" ? body.description : undefined,
      categoryId:
        typeof body?.categoryId === "string" ? body.categoryId : undefined,
    });

    if (!video) {
      return Response.json({ error: "Video not found." }, { status: 404 });
    }

    return Response.json({ video });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Video update failed." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  const { videoId } = await context.params;
  const video = await softDeleteVideo(videoId);

  if (!video) {
    return Response.json({ error: "Video not found." }, { status: 404 });
  }

  return Response.json({ video });
}
