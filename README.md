# File Viewer

Open PDF and Markdown files instantly in your browser — no account needed. Optionally sign in with just an email to keep files, organize them into folders, favorite the ones you use most, and pick up where you left off.

## Features

- **Instant, anonymous viewing** — drag and drop a file (up to 25MB) and view it immediately. Anonymous uploads are session-scoped and auto-deleted after your session ends.
- **PDF viewer** — zoom (50%–250%, auto-fit to width), page rotation, page-by-page navigation with jump-to-page, print, and download.
- **Markdown viewer** — GitHub-flavored Markdown rendering, an outline panel with scroll-synced headings, live word/line count and file size, and light/dark themes.
- **Accounts (optional)** — passwordless sign-in via a 6-digit email one-time code, a full name field and 100MB of permanent storage, folders, favorites, recents, and trash (soft-delete with restore).
- **Storage** — files are stored in S3-compatible object storage via presigned uploads.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io) + PostgreSQL
- S3-compatible object storage (`@aws-sdk/client-s3`)
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
   | `AWS_ACCESS_KEY` / `AWS_SECRET_KEY`                                                              | Credentials for your S3-compatible bucket                                       |
   | `AWS_BUCKET_NAME` / `AWS_REGION`                                                                 | Target bucket and region                                                        |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL` | SMTP settings used to send OTP login codes                                      |
   | `SESSION_SECRET`                                                                                   | Secret used to sign session cookies — generate with`openssl rand -base64 32` |
   | `APP_URL`                                                                                          | Public origin of the deployed app, used for absolute links in emails            |
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
- `lib/` — session handling, database access, S3 upload helpers, server action
