import { accessError, requireActiveAccess } from "@/modules/access/guards";
import { listVideos } from "@/modules/videos/queries";

export async function GET() {
  const auth = await requireActiveAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  return Response.json({
    videos: await listVideos({
      readyOnly: !auth.access.isAdmin,
      syncWithBunny: true,
    }),
  });
}
