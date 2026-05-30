import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentAccess } from "@/modules/access/queries";
import { listCategories } from "@/modules/categories/queries";
import { listVideos } from "@/modules/videos/queries";

import { SignOutButton } from "../../dashboard/sign-out-button";
import { UploadShell } from "./upload-shell";

export default async function UploadPage() {
  const access = await getCurrentAccess();

  if (access.status === "anonymous") {
    redirect("/login");
  }

  if (!access.isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Admin only</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm leading-6 text-muted-foreground">
              This page is for upload and category management.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard">Library</Link>
              </Button>
              <SignOutButton />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const [categories, videos] = await Promise.all([
    listCategories(),
    listVideos({ syncWithBunny: true }),
  ]);

  return (
    <UploadShell
      initialCategories={categories}
      initialVideos={videos}
      user={{ email: access.user.email, role: access.user.role }}
    />
  );
}
