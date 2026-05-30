<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Tooling

- Use `pnpm` for package management and scripts.
- Prefer `pnpm lint`, `pnpm build`, and `pnpm dev` over npm/yarn equivalents.

## Bunny Stream

- Use the full Bunny Stream stack for video infrastructure: Stream HTTP API for video creation/upload/management, Bunny-managed encoding/storage/CDN delivery, and Bunny Player for playback.
- Store only Bunny references and metadata in NeonDB. Do not store video files in the app or database.
- Use `BUNNY_STREAM_API_KEY` as the per-library Stream API key and send it only from server code as the `AccessKey` header.
- Use `BUNNY_STREAM_LIBRARY_ID` for the active video library.
- Use `BUNNY_STREAM_API_BASE_URL`, defaulting to `https://video.bunnycdn.com`, for Stream HTTP API calls.
- Use `BUNNY_STREAM_PLAYER_BASE_URL`, defaulting to `https://player.mediadelivery.net/embed`, for Bunny Player iframe URLs.
- Render Bunny Player only after server-side session, whitelist, and video access checks pass.
- Bunny region/replication is configured in the Bunny dashboard/library settings, not via app env vars.
