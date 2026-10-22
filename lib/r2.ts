import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 speaks the S3 API, so the AWS SDK works against it with a custom endpoint.
// This file has no "server-only" import so scripts/ (run with tsx) can share it with the app.

/** R2_ENDPOINT overrides the default, e.g. for EU jurisdiction buckets: https://<id>.eu.r2.cloudflarestorage.com */
const endpoint =
  process.env.R2_ENDPOINT ??
  (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);

export function createR2Client() {
  return new S3Client({
    region: "auto", // R2 ignores the region, but the SDK requires one
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // Recent AWS SDK versions add CRC32 checksums to every request by default; R2 rejects
    // presigned uploads that carry them. Only send checksums when an operation requires one.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
