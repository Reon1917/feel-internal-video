

## 1. Project Overview

**Project Name:** Internal Recipe Video Platform
**Type:** Private internal web platform
**Industry:** Restaurant / Food Operations
**Primary Goal:**
Provide a secure, fast, and simple internal system for restaurant staff and admins to **upload, organize, search, and watch recipe videos**.

This platform is **not public**, **not consumer-facing**, and **not monetized**.
It is intended for **daily operational use** in kitchens, training rooms, and admin offices.

---

## 2. Business Context

### 2.1 Problem Statement

Restaurants often store recipe videos in:

* Personal Google Drives
* YouTube (unlisted)
* Messaging apps

These approaches create problems:

* No access control
* No centralized search
* Videos get lost over time
* Poor playback experience in kitchens

---

### 2.2 Business Objectives

* Centralize all recipe and training videos
* Restrict access to approved users only
* Enable fast search by recipe/category
* Ensure smooth video playback with minimal buffering
* Reduce operational friction for chefs and managers

---

### 2.3 Target Users

| Role  | Description                  |
| ----- | ---------------------------- |
| Admin | Owner, head chef, or manager |
| Staff | Kitchen staff, trainees      |

---

### 2.4 User Capabilities

#### Admin

* Whitelist users who are allowed to sign up
* Upload recipe videos
* Assign categories to videos
* View and play videos inside the platform
* Search all uploaded videos

#### Staff

* Sign up only if whitelisted
* View and play videos
* Search videos by name or category

---

## 3. Functional Requirements

### 3.1 Authentication & Access Control

* Users **cannot freely sign up**
* Only **pre-whitelisted emails** are allowed
* Authentication uses **email-based login**
* Role-based access:

  * `admin`
  * `staff`

---

### 3.2 Video Management

* Admins can upload videos
* Each video must store:

  * Name / title
  * Category
  * Upload date & time
  * Uploader
* Videos are private and not publicly accessible
* Videos can be played directly inside the platform

---

### 3.3 Search & Discovery

* Search by:

  * Video name
  * Category
* Sort by:

  * Newest first (default)
* Results must be fast and reliable

---

### 3.4 Playback Requirements

* Adaptive streaming (HLS)
* Low buffering even on slower connections
* Token-protected access to prevent sharing
* Embedded player inside the app (no redirects)

---

## 4. Non-Functional Requirements

* Simple UI (kitchen-friendly)
* Mobile & tablet support
* Low operational cost
* Minimal DevOps overhead
* Secure by default
* Scalable to hundreds of videos

---

## 5. Technical Stack

### 5.1 Frontend & Backend

* **Framework:** TanStack Start
* **Routing:** File-based routing
* **Server Logic:** Server Functions / Actions
* **State & Data:** TanStack Query

---

### 5.2 Authentication & Database

* **Service:** Supabase
* **Auth:** Email / magic link
* **Database:** PostgreSQL
* **Security:** Row Level Security (RLS)

---

### 5.3 Video Storage & Streaming

* **Provider:** Bunny.net
* **Service:** Bunny Stream
* **Features Used:**

  * Video upload API
  * Automatic transcoding
  * HLS adaptive streaming
  * Token-based secure playback

---

## 6. Data Model (High Level)

### 6.1 allowed_users

Stores emails permitted to sign up.

| Field      | Type                    |
| ---------- | ----------------------- |
| email      | text (unique)           |
| role       | enum (`admin`, `staff`) |
| created_at | timestamp               |

---

### 6.2 profiles

Stores registered user profiles.

| Field      | Type              |
| ---------- | ----------------- |
| user_id    | uuid (auth.users) |
| email      | text              |
| role       | enum              |
| created_at | timestamp         |

---

### 6.3 videos

Stores video metadata.

| Field          | Type      |
| -------------- | --------- |
| id             | uuid      |
| bunny_video_id | text      |
| title          | text      |
| category       | text      |
| created_at     | timestamp |
| uploaded_by    | uuid      |

---

## 7. Security Model

* Signup blocked unless email exists in `allowed_users`
* RLS enforces:

  * Admin-only upload
  * All users can read videos
* Video URLs are:

  * Tokenized
  * Time-limited
* No direct access to raw video files

---

## 8. Upload & Playback Flow

### 8.1 Upload Flow (Admin)

1. Admin requests new video creation
2. Server calls Bunny Stream API
3. Bunny returns `video_id` and upload endpoint
4. Admin uploads video directly to Bunny
5. Metadata saved in Supabase

---

### 8.2 Playback Flow

1. User selects a video
2. Server generates short-lived playback token
3. Client loads HLS stream via Bunny Stream
4. Video plays inside embedded player

---

## 9. Assumptions & Constraints

* System is private (no public access)
* No video downloads allowed
* Internet access available in kitchen
* No DRM required (token protection is sufficient)
* Admin count is low (1–5 users)

---

## 10. Out of Scope (Explicitly)

* Public video sharing
* Payments or subscriptions
* Comments or social features
* External integrations (Slack, WhatsApp, etc.)
* AI video analysis (for now)

---

## 11. Future Enhancements (Optional)

* Watch progress tracking
* Video notes / annotations
* Multi-restaurant support
* Audit logs (who watched what)
* Offline viewing (controlled devices only)

---

## 12. AI Agent Instructions

When acting on this project:

* Prefer **clarity and simplicity** over complexity
* Avoid over-engineering
* Respect access control and security constraints
* Optimize for **internal operational use**
* Keep costs low and architecture maintainable



