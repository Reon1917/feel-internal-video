"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FolderIcon,
  HomeIcon,
  PlayIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { authClient } from "@/lib/auth-client";
import type { CategoryRow } from "@/modules/categories/queries";
import type { VideoRow } from "@/modules/videos/queries";

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

function formatDuration(duration: number | null) {
  if (!duration || duration < 0) {
    return "--:--";
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link className="text-xs font-semibold uppercase tracking-widest" href="/">
              Feel Internal Video
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Button aria-label="Upload video" asChild size="icon" title="Upload">
                <Link href="/admin/upload">
                  <UploadIcon />
                </Link>
              </Button>
            ) : null}
            <ProfileMenu user={user} />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
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

          <section className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <h1 className="truncate text-3xl font-semibold tracking-normal md:text-4xl">
                    {selectedCategory?.name ?? "Video Library"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredVideos.length} video
                    {filteredVideos.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
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
    <div className="grid gap-x-5 gap-y-8 md:grid-cols-2 2xl:grid-cols-3">
      {videos.map((item) => (
        <Card className="shadow-none ring-0" key={item.id} size="sm">
          <CardContent className="flex flex-col gap-4 px-0">
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
              <CardTitle className="line-clamp-2 min-h-14 text-xl leading-7 tracking-normal normal-case">
                {item.status === "ready" ? (
                  <Link href={`/videos/${item.id}`}>{item.title}</Link>
                ) : (
                  item.title
                )}
              </CardTitle>
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
        // Bunny thumbnail CDN rejects cache-busting query strings in this setup.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          loading="lazy"
          src={video.thumbnailUrl}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlayIcon />
        </div>
      )}
      <span className="absolute bottom-2 right-2 bg-background px-2 py-1 text-xs font-semibold tabular-nums">
        {video.status === "ready" ? formatDuration(video.duration) : video.status}
      </span>
    </>
  );
}

function ProfileMenu({
  user,
}: {
  user: { email: string; role: "admin" | "user" };
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const initial = user.email.charAt(0).toUpperCase();

  async function signOut() {
    setIsPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open profile menu" size="icon" variant="outline">
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuLabel className="normal-case">
          <span className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium normal-case tracking-normal text-foreground">
                {user.email}
              </span>
              <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                {user.role}
              </span>
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/">
              <HomeIcon data-icon="inline-start" />
              Home
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          {isPending ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
