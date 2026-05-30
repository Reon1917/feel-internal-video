"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FolderIcon,
  PlayIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  UploadIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryRow } from "@/modules/categories/queries";
import type { VideoRow } from "@/modules/videos/queries";

import { SignOutButton } from "./sign-out-button";

type DashboardShellProps = {
  initialCategories: CategoryRow[];
  initialVideos: VideoRow[];
  user: {
    email: string;
    role: "admin" | "user";
  };
  isAdmin: boolean;
};

const allCategoriesValue = "all";
const allStatusesValue = "all";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function DashboardShell({
  initialCategories,
  initialVideos,
  user,
  isAdmin,
}: DashboardShellProps) {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(allCategoriesValue);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(allStatusesValue);

  const rootCategories = useMemo(
    () => initialCategories.filter((item) => !item.parentId),
    [initialCategories],
  );
  const childCategories = useMemo(
    () => initialCategories.filter((item) => item.parentId),
    [initialCategories],
  );
  const categoryById = useMemo(
    () => new Map(initialCategories.map((item) => [item.id, item])),
    [initialCategories],
  );
  const selectedCategory = categoryById.get(selectedCategoryId);

  const filteredVideos = initialVideos.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.categoryName.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategoryId === allCategoriesValue ||
      item.categoryId === selectedCategoryId;
    const matchesStatus =
      statusFilter === allStatusesValue || item.status === statusFilter;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const groupedVideos = initialCategories
    .map((category) => ({
      category,
      videos: filteredVideos.filter((item) => item.categoryId === category.id),
    }))
    .filter((group) => group.videos.length > 0);

  const uncategorizedVideos = filteredVideos.filter(
    (item) => !categoryById.has(item.categoryId),
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
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
            {isAdmin ? (
              <Button asChild>
                <Link href="/admin/upload">
                  <UploadIcon data-icon="inline-start" />
                  Upload
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="flex flex-col gap-3 lg:sticky lg:top-4 lg:self-start">
            <Button
              className="justify-start"
              onClick={() => setSelectedCategoryId(allCategoriesValue)}
              variant={
                selectedCategoryId === allCategoriesValue ? "default" : "outline"
              }
            >
              <FolderIcon data-icon="inline-start" />
              All videos
              <span className="ml-auto text-muted-foreground">
                {initialVideos.length}
              </span>
            </Button>
            <div className="flex flex-col gap-1">
              {rootCategories.map((item) => (
                <FolderGroup
                  category={item}
                  childrenCategories={childCategories.filter(
                    (child) => child.parentId === item.id,
                  )}
                  key={item.id}
                  onSelect={setSelectedCategoryId}
                  selectedCategoryId={selectedCategoryId}
                />
              ))}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <h1 className="truncate font-heading text-3xl font-semibold tracking-wider uppercase md:text-4xl">
                    {selectedCategory?.name ?? "Video Library"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredVideos.length} video
                    {filteredVideos.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_190px]">
                <label className="relative block">
                  <span className="sr-only">Search videos</span>
                  <SearchIcon className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-7"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search videos"
                    value={search}
                  />
                </label>
                {isAdmin ? (
                  <Select onValueChange={setStatusFilter} value={statusFilter}>
                    <SelectTrigger className="w-full">
                      <SlidersHorizontalIcon data-icon="inline-start" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={allStatusesValue}>All</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <Empty className="min-h-96 border border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PlayIcon />
                  </EmptyMedia>
                  <EmptyTitle>No videos</EmptyTitle>
                  <EmptyDescription>
                    {isAdmin ? "Upload from the upload page." : "Nothing is ready here yet."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : selectedCategoryId === allCategoriesValue ? (
              <div className="flex flex-col gap-8">
                {groupedVideos.map((group) => (
                  <VideoSection
                    key={group.category.id}
                    title={group.category.name}
                    videos={group.videos}
                  />
                ))}
                {uncategorizedVideos.length > 0 ? (
                  <VideoSection
                    title="Uncategorized"
                    videos={uncategorizedVideos}
                  />
                ) : null}
              </div>
            ) : (
              <VideoGrid videos={filteredVideos} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FolderGroup({
  category,
  childrenCategories,
  selectedCategoryId,
  onSelect,
}: {
  category: CategoryRow;
  childrenCategories: CategoryRow[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <CategoryButton
        category={category}
        isActive={selectedCategoryId === category.id}
        onClick={() => onSelect(category.id)}
      />
      {childrenCategories.map((child) => (
        <CategoryButton
          category={child}
          inset
          isActive={selectedCategoryId === child.id}
          key={child.id}
          onClick={() => onSelect(child.id)}
        />
      ))}
    </div>
  );
}

function CategoryButton({
  category,
  inset,
  isActive,
  onClick,
}: {
  category: CategoryRow;
  inset?: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      className={inset ? "justify-start pl-9" : "justify-start"}
      onClick={onClick}
      variant={isActive ? "default" : "ghost"}
    >
      <FolderIcon data-icon="inline-start" />
      <span className="min-w-0 flex-1 truncate text-left">{category.name}</span>
      <span className="text-muted-foreground">{category.videoCount}</span>
    </Button>
  );
}

function VideoSection({ title, videos }: { title: string; videos: VideoRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest">{title}</h2>
        <span className="text-sm text-muted-foreground">{videos.length}</span>
      </div>
      <VideoGrid videos={videos} />
    </section>
  );
}

function VideoGrid({ videos }: { videos: VideoRow[] }) {
  return (
    <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
      {videos.map((item) => (
        <Card className="shadow-none ring-0" key={item.id} size="sm">
          <CardContent className="flex flex-col gap-3 px-0">
            {item.status === "ready" ? (
              <Link
                className="group relative block aspect-video overflow-hidden bg-muted"
                href={`/videos/${item.id}`}
              >
                <VideoThumb video={item} />
              </Link>
            ) : (
              <div className="relative aspect-video overflow-hidden bg-muted opacity-70">
                <VideoThumb video={item} />
              </div>
            )}
            <CardHeader className="px-0">
              <CardTitle className="line-clamp-2 text-base tracking-normal normal-case">
                {item.status === "ready" ? (
                  <Link href={`/videos/${item.id}`}>{item.title}</Link>
                ) : (
                  item.title
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="secondary">{item.categoryName}</Badge>
              </CardAction>
            </CardHeader>
            <p className="text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </p>
            {item.status === "processing" ? (
              <div className="flex flex-col gap-2">
                <div className="h-1.5 overflow-hidden bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${item.encodeProgress ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Encoding {item.encodeProgress ?? 0}%
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function VideoThumb({ video }: { video: VideoRow }) {
  return (
    <>
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          src={video.thumbnailUrl}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlayIcon />
        </div>
      )}
      <span className="absolute bottom-2 right-2 bg-background px-2 py-1 text-xs font-semibold uppercase tracking-wider">
        {video.status}
      </span>
    </>
  );
}
