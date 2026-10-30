// Standalone cleanup script for expired anonymous files.
// Run manually with `npx tsx scripts/cleanup-expired-files.ts`, or wire up to
// a real cron (OS cron, Vercel Cron, etc.) later — this is the seam for that.
import "dotenv/config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { createR2Client, R2_BUCKET } from "../lib/r2.js";

const s3 = createR2Client();
const S3_BUCKET = R2_BUCKET;

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const expired = await prisma.file.findMany({ where: { expiresAt: { lte: new Date() } } });
  console.log(`Found ${expired.length} expired file(s).`);

  for (const file of expired) {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file.s3Key })).catch((err) => {
      console.error(`Failed to delete S3 object ${file.s3Key}:`, err);
    });
    await prisma.file.delete({ where: { id: file.id } });
    console.log(`Cleaned up ${file.id} (${file.s3Key})`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
