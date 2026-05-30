type BunnyVideoResponse = {
  guid?: string;
  videoId?: string;
  id?: string;
  libraryId?: number | string;
  title?: string;
  thumbnailFileName?: string | null;
  length?: number;
  status?: number;
};

type BunnyVideoPlayDataResponse = {
  video?: {
    length?: number;
    status?: number;
    encodeProgress?: number;
    thumbnailFileName?: string | null;
  };
  thumbnailUrl?: string | null;
  isPlayable?: boolean;
  isPlaylistPlayable?: boolean;
};

export type BunnySyncedVideo = {
  status: "processing" | "ready" | "failed";
  thumbnailUrl: string | null;
  duration: number | null;
  encodeProgress: number | null;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getBunnyConfig() {
  return {
    apiKey: getRequiredEnv("BUNNY_STREAM_API_KEY"),
    libraryId: getRequiredEnv("BUNNY_STREAM_LIBRARY_ID"),
    apiBaseUrl:
      process.env.BUNNY_STREAM_API_BASE_URL ?? "https://video.bunnycdn.com",
    playerBaseUrl:
      process.env.BUNNY_STREAM_PLAYER_BASE_URL ??
      "https://player.mediadelivery.net/embed",
  };
}

export function buildBunnyPlayerUrl(input: {
  libraryId: string;
  videoId: string;
}) {
  const baseUrl =
    process.env.BUNNY_STREAM_PLAYER_BASE_URL ??
    "https://player.mediadelivery.net/embed";

  return `${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(
    input.libraryId,
  )}/${encodeURIComponent(input.videoId)}`;
}

export async function createBunnyVideo(title: string) {
  const config = getBunnyConfig();
  const response = await fetch(
    `${config.apiBaseUrl.replace(/\/$/, "")}/library/${config.libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: config.apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!response.ok) {
    throw new Error(`Bunny video creation failed with ${response.status}.`);
  }

  const data = (await response.json()) as BunnyVideoResponse;
  const videoId = data.guid ?? data.videoId ?? data.id;

  if (!videoId) {
    throw new Error("Bunny did not return a video ID.");
  }

  return {
    libraryId: String(data.libraryId ?? config.libraryId),
    videoId,
    raw: data,
  };
}

export async function uploadBunnyVideo(input: {
  libraryId: string;
  videoId: string;
  file: File;
}) {
  const config = getBunnyConfig();
  const response = await fetch(
    `${config.apiBaseUrl.replace(/\/$/, "")}/library/${input.libraryId}/videos/${
      input.videoId
    }`,
    {
      method: "PUT",
      headers: {
        AccessKey: config.apiKey,
        Accept: "application/json",
      },
      body: input.file,
    },
  );

  if (!response.ok) {
    throw new Error(`Bunny upload failed with ${response.status}.`);
  }

  return response.json().catch(() => ({ success: true }));
}

function mapBunnyStatus(input: {
  status?: number;
  isPlayable?: boolean;
  isPlaylistPlayable?: boolean;
}) {
  if (input.isPlayable || input.isPlaylistPlayable) {
    return "ready";
  }

  if (input.status === 3 || input.status === 4) {
    return "ready";
  }

  if (input.status === 5 || input.status === 6 || input.status === 8) {
    return "failed";
  }

  return "processing";
}

export async function getBunnyVideoPlayData(input: {
  libraryId: string;
  videoId: string;
}): Promise<BunnySyncedVideo> {
  const config = getBunnyConfig();
  const response = await fetch(
    `${config.apiBaseUrl.replace(/\/$/, "")}/library/${input.libraryId}/videos/${
      input.videoId
    }/play`,
    {
      headers: {
        AccessKey: config.apiKey,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Bunny video sync failed with ${response.status}.`);
  }

  const data = (await response.json()) as BunnyVideoPlayDataResponse;
  const encodeProgress =
    typeof data.video?.encodeProgress === "number"
      ? Math.max(0, Math.min(100, data.video.encodeProgress))
      : null;

  return {
    status: mapBunnyStatus({
      status: data.video?.status,
      isPlayable: data.isPlayable,
      isPlaylistPlayable: data.isPlaylistPlayable,
    }),
    thumbnailUrl: data.thumbnailUrl ?? null,
    duration:
      typeof data.video?.length === "number" && data.video.length > 0
        ? data.video.length
        : null,
    encodeProgress,
  };
}
