"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  FolderPlusIcon,
  Loader2Icon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryRow } from "@/modules/categories/queries";
import type { VideoRow } from "@/modules/videos/queries";

import { SignOutButton } from "../../dashboard/sign-out-button";

type UploadShellProps = {
  initialCategories: CategoryRow[];
  initialVideos: VideoRow[];
  user: {
    email: string;
    role: "admin" | "user";
  };
};

type PendingAction =
  | "category:create"
  | "video:upload"
  | `video:${string}`
  | `category:${string}`
  | null;

const rootCategoryValue = "root";

type UploadProgress = {
  percent: number;
  label: string;
} | null;

export function UploadShell({
  initialCategories,
  initialVideos,
  user,
}: UploadShellProps) {
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [videos, setVideos] = useState(initialVideos);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);

  const rootCategories = useMemo(
    () => categories.filter((item) => !item.parentId),
    [categories],
  );

  async function refreshAdminData() {
    const [categoryResponse, videoResponse] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/videos"),
    ]);

    if (categoryResponse.ok) {
      const data = (await categoryResponse.json()) as {
        categories: CategoryRow[];
      };
      setCategories(data.categories);
    }

    if (videoResponse.ok) {
      const data = (await videoResponse.json()) as { videos: VideoRow[] };
      setVideos(data.videos);
    }
  }

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("category:create");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        parentId: formData.get("parentId"),
      }),
    });

    setPendingAction(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      toast.error(data?.error ?? "Category failed.");
      return;
    }

    categoryFormRef.current?.reset();
    setCategoryDialogOpen(false);
    toast.success("Category added.");
    await refreshAdminData();
  }

  async function uploadVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("video:upload");
    setUploadProgress({ percent: 5, label: "Preparing upload" });

    try {
      await uploadWithProgress(new FormData(event.currentTarget), (progress) => {
        setUploadProgress(progress);
      });
      setUploadProgress({ percent: 100, label: "Upload complete" });
      uploadFormRef.current?.reset();
      toast.success("Upload sent to Bunny.");
      await refreshAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setPendingAction(null);
      window.setTimeout(() => setUploadProgress(null), 900);
    }
  }

  async function deleteVideo(id: string) {
    setPendingAction(`video:${id}`);

    const response = await fetch(`/api/admin/videos/${id}`, {
      method: "DELETE",
    });

    setPendingAction(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      toast.error(data?.error ?? "Video delete failed.");
      return;
    }

    await refreshAdminData();
  }

  async function deleteCategory(id: string) {
    setPendingAction(`category:${id}`);

    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    setPendingAction(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      toast.error(data?.error ?? "Category delete failed.");
      return;
    }

    await refreshAdminData();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <Link className="text-xs font-semibold uppercase tracking-widest" href="/">
              Feel Internal Video
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="truncate">{user.email}</span>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Library</Link>
            </Button>
            <SignOutButton />
          </div>
        </header>

        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Admin
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
                Upload video
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create the folder first, then upload into it.
              </p>
            </div>
            <CreateCategoryDialog
              categoryFormRef={categoryFormRef}
              isOpen={categoryDialogOpen}
              onOpenChange={setCategoryDialogOpen}
              onSubmit={createCategory}
              pendingAction={pendingAction}
              rootCategories={rootCategories}
            />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>New video</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col gap-6"
                onSubmit={uploadVideo}
                ref={uploadFormRef}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="video-title">Title</FieldLabel>
                    <Input id="video-title" name="title" required />
                  </Field>
                  <Field data-disabled={categories.length === 0}>
                    <FieldLabel htmlFor="video-category">Category</FieldLabel>
                    <Select disabled={categories.length === 0} name="categoryId" required>
                      <SelectTrigger className="w-full" id="video-category">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.parentId ? "- " : ""}
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {categories.length === 0 ? (
                      <FieldDescription>
                        Add a category before uploading.
                      </FieldDescription>
                    ) : null}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="video-description">
                      Description
                    </FieldLabel>
                    <Textarea id="video-description" name="description" rows={3} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="video-file">File</FieldLabel>
                    <Input
                      accept="video/*"
                      id="video-file"
                      name="file"
                      required
                      type="file"
                    />
                  </Field>
                </FieldGroup>
                <Button
                  disabled={pendingAction === "video:upload" || categories.length === 0}
                  type="submit"
                >
                  {pendingAction === "video:upload" ? (
                    <Loader2Icon data-icon="inline-start" />
                  ) : (
                    <UploadIcon data-icon="inline-start" />
                  )}
                  Upload
                </Button>
                {uploadProgress ? (
                  <UploadProgressBar progress={uploadProgress} />
                ) : null}
              </form>
            </CardContent>
          </Card>

          <CategoryManager
            categories={categories}
            onDelete={deleteCategory}
            pendingAction={pendingAction}
          />
        </div>

        <VideoManager
          onDelete={deleteVideo}
          pendingAction={pendingAction}
          videos={videos}
        />
      </div>
    </main>
  );
}

function CreateCategoryDialog({
  isOpen,
  onOpenChange,
  rootCategories,
  pendingAction,
  categoryFormRef,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rootCategories: CategoryRow[];
  pendingAction: PendingAction;
  categoryFormRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button>
          <FolderPlusIcon data-icon="inline-start" />
          New category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Add a root folder or place it under an existing root folder.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={onSubmit} ref={categoryFormRef}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input id="category-name" name="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-parent">Parent</FieldLabel>
              <Select defaultValue={rootCategoryValue} name="parentId">
                <SelectTrigger className="w-full" id="category-parent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={rootCategoryValue}>Root</SelectItem>
                    {rootCategories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <Button disabled={pendingAction === "category:create"} type="submit">
            {pendingAction === "category:create" ? (
              <Loader2Icon data-icon="inline-start" />
            ) : (
              <FolderPlusIcon data-icon="inline-start" />
            )}
            Add category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryManager({
  categories,
  pendingAction,
  onDelete,
}: {
  categories: CategoryRow[];
  pendingAction: PendingAction;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <Empty className="min-h-64 border border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderPlusIcon />
              </EmptyMedia>
              <EmptyTitle>No categories</EmptyTitle>
              <EmptyDescription>Create one before uploading.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Videos</TableHead>
                <TableHead>Folders</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.parentId ? "- " : ""}
                    {item.name}
                  </TableCell>
                  <TableCell>{item.videoCount}</TableCell>
                  <TableCell>{item.childCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      disabled={
                        pendingAction === `category:${item.id}` ||
                        item.videoCount > 0 ||
                        item.childCount > 0
                      }
                      onClick={() => onDelete(item.id)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function VideoManager({
  videos,
  pendingAction,
  onDelete,
}: {
  videos: VideoRow[];
  pendingAction: PendingAction;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded videos</CardTitle>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <Empty className="min-h-64 border border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UploadIcon />
              </EmptyMedia>
              <EmptyTitle>No uploads</EmptyTitle>
              <EmptyDescription>Uploaded videos appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-72 truncate">{item.title}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>
                    <VideoStatusBadge video={item} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      disabled={pendingAction === `video:${item.id}`}
                      onClick={() => onDelete(item.id)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function uploadWithProgress(
  formData: FormData,
  onProgress: (progress: NonNullable<UploadProgress>) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", "/api/admin/videos");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress({ percent: 20, label: "Uploading" });
        return;
      }

      const browserUploadProgress = Math.round((event.loaded / event.total) * 80);
      onProgress({
        percent: Math.max(5, Math.min(80, browserUploadProgress)),
        label: "Uploading",
      });
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      try {
        const body = JSON.parse(request.responseText) as { error?: string };
        reject(new Error(body.error ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };

    request.onerror = () => reject(new Error("Upload failed."));
    request.onloadend = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress({ percent: 90, label: "Processing request" });
      }
    };

    request.send(formData);
    onProgress({ percent: 12, label: "Uploading" });
  });
}

function UploadProgressBar({
  progress,
}: {
  progress: NonNullable<UploadProgress>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-1.5 overflow-hidden bg-muted">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{progress.label}</span>
        <span>{progress.percent}%</span>
      </div>
    </div>
  );
}

function VideoStatusBadge({ video }: { video: VideoRow }) {
  if (video.status === "ready") {
    return <Badge>Ready</Badge>;
  }

  if (video.status === "failed") {
    return <Badge variant="destructive">Failed</Badge>;
  }

  return (
    <div className="flex min-w-36 flex-col gap-2">
      <Badge variant="secondary">Processing</Badge>
      <div className="h-1.5 overflow-hidden bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${video.encodeProgress ?? 0}%` }}
        />
      </div>
    </div>
  );
}
