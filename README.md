# File Viewer

Open PDF and Markdown files instantly in your browser — no account needed. Optionally sign in with just an email to keep files, organize them into folders, favorite the ones you use most, and pick up where you left off.

## Features

- **Instant, anonymous viewing** — drag and drop a file (up to 25MB) and view it immediately. Anonymous uploads are session-scoped and auto-deleted after your session ends.
- **PDF viewer** — zoom (50%–250%, auto-fit to width), page rotation, page-by-page navigation with jump-to-page, print, and download.
- **Markdown viewer** — GitHub-flavored Markdown rendering, an outline panel with scroll-synced headings, live word/line count and file size, and light/dark themes.
- **Accounts (optional)** — passwordless sign-in via a 6-digit email one-time code, a full name field and 100MB of permanent storage, folders, favorites, recents, and trash (soft-delete with restore).
- **Storage** — files are stored in Cloudflare R2 (S3-compatible object storage) via presigned uploads.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io) + PostgreSQL
- Cloudflare R2 object storage, accessed with the S3 API (`@aws-sdk/client-s3`)
- Tailwind CSS v4
- `react-pdf` for PDF rendering, `react-markdown` + `remark-gfm` for Markdown
- Email OTP auth via `nodemailer` and signed session cookies (`jose`)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable                                                                                             | Description                                                                     |
   | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
   | `DATABASE_URL`                                                                                     | PostgreSQL connection string                                                    |
   | `R2_ACCOUNT_ID`                                                                                  | Cloudflare account ID (R2 overview page)                                        |
   | `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`                                                      | R2 API token with Object Read & Write on the bucket                             |
   | `R2_BUCKET_NAME`                                                                                 | Target R2 bucket                                                                |
   | `R2_ENDPOINT` (optional)                                                                         | Override the endpoint, e.g. for EU jurisdiction buckets                         |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL` | SMTP settings used to send OTP login codes                                      |
   | `SESSION_SECRET`                                                                                   | Secret used to sign session cookies — generate with`openssl rand -base64 32` |
   | `APP_URL`                                                                                          | Public origin of the deployed app, used for absolute links in emails            |

   **R2 bucket CORS.** Browsers upload files straight to R2 with presigned URLs, so add this under
   *Bucket → Settings → CORS policy* (replace the origin with your app's URL):

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   Coming from AWS S3? The old `AWS_*` variables are no longer read; map them to the `R2_*` ones above.

3. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   ```
4. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the upload/landing page.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm start` — start the production server
- `npm run lint` — run ESLint
- `npx tsx scripts/cleanup-expired-files.ts` — permanently delete expired anonymous files (also runs lazily on page views; intended to be scheduled via cron in production)

## Project structure

- `app/upload` — public landing page and anonymous upload flow
- `app/view/[fileId]` — anonymous file viewer (temporary, session-scoped)
- `app/(app)` — signed-in dashboard: files, folders, favorites, recent, trash, account, settings
- `app/(auth)` — email OTP login/verify flow
- `components/pdf-viewer`, `components/markdown-viewer` — file viewers
- `lib/` — session handling, database access, R2 upload helpers, server action
