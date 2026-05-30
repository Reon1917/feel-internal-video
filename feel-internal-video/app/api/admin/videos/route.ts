import { accessError, requireAdminAccess } from "@/modules/access/guards";
import { getCategoryById } from "@/modules/categories/queries";
import { createBunnyVideo, uploadBunnyVideo } from "@/modules/videos/bunny";
import { createVideoRecord } from "@/modules/videos/queries";

export async function POST(request: Request) {
  const auth = await requireAdminAccess();

  if (!auth.ok) {
    return accessError(auth.status, auth.message);
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const file = formData.get("file");

  if (!title || !categoryId || !(file instanceof File) || file.size === 0) {
    return Response.json(
      { error: "Title, category, and video file are required." },
      { status: 400 },
    );
  }

  try {
    const category = await getCategoryById(categoryId);

    if (!category) {
      return Response.json({ error: "Category not found." }, { status: 400 });
    }

    const bunnyVideo = await createBunnyVideo(title);

    await uploadBunnyVideo({
      libraryId: bunnyVideo.libraryId,
      videoId: bunnyVideo.videoId,
      file,
    });

    const video = await createVideoRecord({
      title,
      description,
      categoryId,
      bunnyLibraryId: bunnyVideo.libraryId,
      bunnyVideoId: bunnyVideo.videoId,
      uploadedByAdminId: auth.access.user.id,
    });

    return Response.json({ video }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
