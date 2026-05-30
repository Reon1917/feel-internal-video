import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentAccess } from "@/modules/access/queries";
import { getVideoById } from "@/modules/videos/queries";

type VideoPageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function VideoPage({ params }: VideoPageProps) {
  const access = await getCurrentAccess();

  if (access.status === "anonymous") {
    redirect("/login");
  }

  if (!access.isActive) {
    redirect("/dashboard");
  }

  const { videoId } = await params;
  const video = await getVideoById(videoId);

  if (!video || video.status === "deleted") {
    notFound();
  }

  if (video.status !== "ready") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>{video.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Badge variant="secondary">{video.status}</Badge>
            <p className="text-sm leading-6 text-muted-foreground">
              This video is not ready for playback.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back</Link>
          </Button>
          <Badge variant="secondary">{video.categoryName}</Badge>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-normal md:text-4xl">
              {video.title}
            </h1>
            {video.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {video.description}
              </p>
            ) : null}
          </div>

          <div className="aspect-video overflow-hidden bg-black">
            <iframe
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              loading="lazy"
              src={video.playerUrl}
              title={video.title}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
