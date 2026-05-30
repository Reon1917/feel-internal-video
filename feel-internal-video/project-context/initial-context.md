# Project Context: Internal Restaurant Video Platform

## 1. Project Overview

This project is an internal video platform for a restaurant business. The platform is used to upload, organize, manage, and watch internal restaurant videos such as staff training, kitchen process videos, cashier instructions, delivery process guides, cleaning SOPs, onboarding videos, and operational announcements.

The platform is not a public video platform. It is intended for private/internal use only. Access is controlled through an email-based whitelist system. Only approved users can log in and watch videos.

The app is built as a web application using Next.js and TypeScript. The business logic is mainly around user access control, admin-controlled video/category management, and structured video browsing.

Video infrastructure is handled by Bunny CDN / Bunny Stream. Bunny Stream handles video storage, processing, streaming, CDN delivery, and video player support. The application only needs to integrate with Bunny using the API key and store Bunny video references in the database.

---

## 2. Core Goal

The goal is to provide a simple internal video library for restaurant staff and admins.

Admins should be able to:

- Manage video categories and subcategories.
- Upload videos into categories.
- Edit video metadata.
- Delete videos.
- Manage whitelisted user emails.
- Delist users when they should no longer have access.

Users should be able to:

- Log in only if their email is whitelisted.
- Browse video categories.
- Open nested categories like a file system.
- Watch videos inside the web app using the Bunny video player.

---

## 3. Tech Stack

### Frontend / Full-stack Framework

- Next.js
- TypeScript
- App Router
- Server Components where suitable
- Server Actions or Route Handlers for backend operations

### Database

- NeonDB Postgres
- Drizzle ORM

### Authentication

- Better Auth
- Email-based login/authentication
- Admin role support
- Whitelist-based access control

### Video Infrastructure

- Bunny CDN / Bunny Stream
- Bunny Stream handles:
  - Video storage
  - Video upload handling
  - Video processing/transcoding
  - CDN delivery
  - Stream playback
  - Bunny video player

The app does not manually build its own video transcoding pipeline. It only integrates with Bunny APIs and stores Bunny metadata in the database.

### Hosting

- Vercel for the Next.js app
- NeonDB free tier for database during early stage
- Bunny Stream/CDN for video hosting and playback

---

## 4. Bunny Video Integration Context

The project uses the full Bunny video stack. Bunny Stream creates and manages the video infrastructure for the app.

The app should not treat video storage, encoding, CDN delivery, and video playback as separate custom systems. Bunny handles these parts.

The application only needs to:

1. Store Bunny API credentials securely in environment variables.
2. Create/upload videos through Bunny API.
3. Store Bunny video IDs and related metadata in NeonDB.
4. Show the Bunny video player inside the web app.
5. Ensure users are authenticated and whitelisted before allowing access to video pages.

Recommended Bunny region setup:

- Main region: Singapore, because the restaurant users are expected to be in Thailand/Bangkok.
- Additional replication regions are optional and not required for MVP because video access is low frequency.

Expected video usage:

- Around 400 videos maximum.
- Each video is around 3–5 minutes.
- Quality may range from 1080p to 4K.
- Access is expected to be low, around 1–5 video views per day.

Estimated storage planning:

- Likely: 250GB–400GB.
- Safe planning estimate: 500GB.
- Heavy 4K scenario: 1TB+.

Estimated monthly infrastructure cost:

- Vercel Pro: around $20/month for production use.
- NeonDB: $0/month during early stage using free tier.
- Bunny Stream/CDN: roughly $1–$15/month depending on video storage and playback.
- Safe production estimate: around $25–$35/month.
- Safe budget reserve: $50/month.

---

## 5. Main Business Logic

### 5.1 User Access Control

The app uses an email whitelist system.

A user can only access the platform if their email exists in the whitelist and is currently active.

Access should not only be checked during signup. A user may be whitelisted today and delisted later. Therefore, protected pages and video routes must always verify that the user is still active in the whitelist.

Basic access rule:

```txt
User logs in
→ Check Better Auth session
→ Check user email against whitelist_emails table
→ If active, allow access
→ If missing or revoked, block access
```

### 5.2 Admin Role

Admins can manage the internal video platform.

Admin capabilities:

- Create categories.
- Create subcategories.
- Rename categories.
- Delete categories when safe.
- Upload videos.
- Edit video title, description, and category.
- Delete videos.
- Add user emails to whitelist.
- Revoke/delist user emails.

Admin access should be role-protected. A normal whitelisted user should not be able to access admin pages or API actions.

### 5.3 Email Whitelisting and Delisting

The whitelist should be managed by admins.

Whitelist behavior:

- Admin adds an email to the whitelist.
- User with that email can log in and access the platform.
- Admin can revoke/delist an email.
- Delisted users should immediately lose access on their next request/page load.
- Delisted users should not be able to continue watching videos just because they had an old account.

Suggested whitelist statuses:

- `active`
- `revoked`

### 5.4 Category System

The video category system should work like a file system.

Admins can create categories inside categories.

Example:

```txt
Training
  Kitchen
    Food Prep
    Cleaning
  Cashier
  Delivery
Announcements
New Staff Onboarding
```

Recommended structure:

- Each category has an optional `parentId`.
- A category with `parentId = null` is a root category.
- A category with a `parentId` is a subcategory.
- Videos belong to one category.

For MVP, a simple parent-child model is enough. Complex tree algorithms are not required unless the category system becomes very large.

### 5.5 Video Management

Videos are uploaded and managed by admins.

Video records in the database should only store metadata and Bunny references. The actual video file should be stored and processed by Bunny Stream.

Admin video flow:

```txt
Admin logs in
→ Admin selects category
→ Admin uploads video
→ App creates Bunny video/upload request
→ Bunny handles video storage and processing
→ App stores Bunny video ID in NeonDB
→ Video status becomes processing
→ When ready, video can be played in the app
```

Video status examples:

- `processing`
- `ready`
- `failed`
- `deleted`

### 5.6 Video Playback

Users watch videos inside the web app using the Bunny video player.

Playback flow:

```txt
User opens video page
→ App checks user session
→ App checks whitelist status
→ App checks video exists and is ready
→ App renders Bunny video player
```

The frontend should not simply hide video pages. Server-side checks are required before rendering protected video content.

### 5.7 Search and Browsing

MVP browsing should support:

- Root category list.
- Nested category navigation.
- Videos inside a selected category.
- Basic video title search.

Optional later features:

- Recently watched videos.
- Required training videos.
- Completion tracking.
- Staff onboarding path.
- Video analytics.
- Role-based category access.
- Quiz after video.

---

## 6. Suggested Database Model

### users

Managed mostly by Better Auth.

Useful app-level fields:

```txt
id
email
name
role: admin | user
createdAt
updatedAt
```

### whitelist_emails

```txt
id
email
status: active | revoked
addedByAdminId
createdAt
revokedAt
revokedByAdminId
note
```

Important rule:

- Email should be unique.
- Normalize emails to lowercase before storing and checking.

### categories

```txt
id
name
parentId nullable
sortOrder
createdByAdminId
createdAt
updatedAt
```

Important rules:

- `parentId = null` means root category.
- Prevent circular parent relationships.
- Do not allow deleting a category if it contains videos or subcategories unless using a clear cascading/delete-confirmation flow.

### videos

```txt
id
title
description
categoryId
bunnyLibraryId
bunnyVideoId
thumbnailUrl
duration
status: processing | ready | failed | deleted
uploadedByAdminId
createdAt
updatedAt
```

Important rules:

- Video files are not stored in NeonDB.
- NeonDB only stores references and metadata.
- Bunny Stream is the source for actual video assets.

### video_access_logs

Optional but useful.

```txt
id
userId
videoId
watchedAt
watchDurationSeconds
completed boolean
ipAddress optional
userAgent optional
```

For MVP, access logs can be skipped unless analytics are needed.

---

## 7. Core Pages

### Public / Auth Pages

- Login page
- Unauthorized page for non-whitelisted users

### User Pages

- Dashboard / video library home
- Category browser
- Video list page
- Video player page
- Search page

### Admin Pages

- Admin dashboard
- Manage categories
- Upload video
- Manage videos
- Manage whitelist emails
- User access management

---

## 8. Environment Variables

Expected environment variables:

```txt
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
BUNNY_STREAM_API_KEY=
BUNNY_STREAM_LIBRARY_ID=
BUNNY_STREAM_API_BASE_URL=
BUNNY_STREAM_PLAYER_BASE_URL=
```

All Bunny credentials must stay server-side. They should never be exposed directly to the browser.

---

## 9. Security Rules

1. All admin actions must require an authenticated admin user.
2. All user video pages must require an authenticated and whitelisted user.
3. Whitelist checks must happen on protected server routes/pages, not only during signup.
4. Delisted users must lose access even if their Better Auth account still exists.
5. Bunny API key must only be used server-side.
6. Video player URLs should only be rendered after access checks.
7. Normal users must not be able to create, edit, or delete videos/categories.
8. Normal users must not be able to view admin pages.

---

## 10. MVP Scope

### Admin MVP

- Admin login.
- Add whitelist email.
- Revoke whitelist email.
- Create category.
- Create subcategory.
- Rename category.
- Upload video to Bunny Stream.
- Store Bunny video metadata in NeonDB.
- Edit video title/description/category.
- Delete video.

### User MVP

- Login.
- Block access if email is not whitelisted.
- Browse categories.
- Open subcategories.
- See videos inside category.
- Search videos by title.
- Watch videos using Bunny video player.

---

## 11. Out of Scope for MVP

The following features are not required for the first version:

- Mobile app.
- Public registration.
- Payment system.
- Social features.
- Comments.
- Likes.
- Complex recommendation algorithm.
- Custom video transcoding pipeline.
- Self-hosted video streaming server.
- Multi-tenant organization system.
- Complex role-per-category permission system.
- Advanced analytics dashboard.

---

## 12. Future Features

Possible future improvements:

- Training completion tracking.
- Required videos for new staff.
- Staff onboarding playlist.
- Video quiz after watching.
- Per-category role access.
- Manager-only videos.
- View analytics.
- Watch progress saving.
- Recently watched section.
- Admin notifications when Bunny processing fails.
- Bulk video upload.
- Bulk whitelist import via CSV.
- Expiring access for temporary staff.

---

## 13. Key Product Principle

Keep the platform simple.

The restaurant does not need a public creator platform. It needs a reliable internal knowledge and training video system.

The app should focus on:

- Clear category organization.
- Simple admin upload flow.
- Reliable whitelist access control.
- Smooth video playback.
- Low operating cost.

Bunny should handle the video infrastructure. The Next.js app should handle business logic, user access, admin workflows, and metadata management.
