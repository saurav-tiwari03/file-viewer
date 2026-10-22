import "server-only";
import { createR2Client, R2_BUCKET } from "@/lib/r2";

// Object storage is Cloudflare R2 (S3-compatible). The names below are kept so the
// routes and server actions that already import `s3` / `S3_BUCKET` don't change.
export const s3 = createR2Client();
export const S3_BUCKET = R2_BUCKET;
