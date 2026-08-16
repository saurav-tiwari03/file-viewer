import "server-only";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";
import { s3, S3_BUCKET } from "@/lib/s3";

let lastRun = 0;
const MIN_INTERVAL_MS = 5 * 60 * 1000; // don't re-run more than once per 5 minutes

export async function cleanupExpiredFiles() {
  const expired = await prisma.file.findMany({
    where: { expiresAt: { lte: new Date() } },
  });

  for (const file of expired) {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file.s3Key })).catch(() => {});
    await prisma.file.delete({ where: { id: file.id } }).catch(() => {});
  }

  return expired.length;
}

/**
 * Fire-and-forget cleanup, throttled so it doesn't run on every single request.
 * This is a stand-in for real cron infra (see scripts/cleanup-expired-files.ts).
 */
export function triggerLazyCleanup() {
  const now = Date.now();
  if (now - lastRun < MIN_INTERVAL_MS) return;
  lastRun = now;
  void cleanupExpiredFiles().catch((err) => console.error("Lazy cleanup failed:", err));
}
