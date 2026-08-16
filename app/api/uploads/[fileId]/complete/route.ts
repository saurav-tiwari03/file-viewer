import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "@/lib/s3";
import { prisma } from "@/lib/db";
import { getAnonymousSessionId } from "@/lib/anon-session";
import { getSession } from "@/lib/session";
import { userPrefix, anonymousPrefix } from "@/lib/s3-keys";
import { ANONYMOUS_MAX_FILE_SIZE, ANONYMOUS_FILE_TTL_MS, hasSupportedExtension } from "@/lib/definitions";

const CompleteRequestSchema = z.object({
  s3Key: z.string().min(1),
  filename: z.string().min(1).max(255),
  mimetype: z.enum(["application/pdf", "text/markdown"]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = CompleteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { s3Key, filename, mimetype } = parsed.data;

  if (!hasSupportedExtension(filename)) {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const session = await getSession();

  let realSize: number;
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
    realSize = head.ContentLength ?? 0;
  } catch {
    return NextResponse.json({ error: "Upload not found in storage." }, { status: 400 });
  }

  if (session) {
    if (!s3Key.startsWith(`${userPrefix(session.userId, session.email)}${fileId}/`)) {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }

    try {
      const file = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({ where: { id: session.userId } });
        if (user.storageUsed + BigInt(realSize) > user.storageQuota) {
          throw new Error("QUOTA_EXCEEDED");
        }

        await tx.user.update({
          where: { id: user.id },
          data: { storageUsed: { increment: realSize } },
        });

        return tx.file.create({
          data: {
            id: fileId,
            filename,
            mimetype,
            size: BigInt(realSize),
            s3Key,
            ownerId: user.id,
          },
        });
      });

      return NextResponse.json({
        id: file.id,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size.toString(),
      });
    } catch (err) {
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
      if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
        return NextResponse.json({ error: "This upload would exceed your storage quota." }, { status: 413 });
      }
      return NextResponse.json({ error: "Could not complete the upload." }, { status: 500 });
    }
  }

  // Anonymous upload.
  const anonSessionId = await getAnonymousSessionId();
  if (!anonSessionId || !s3Key.startsWith(`${anonymousPrefix(anonSessionId)}${fileId}/`)) {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
    return NextResponse.json({ error: "No anonymous session found." }, { status: 400 });
  }

  if (realSize > ANONYMOUS_MAX_FILE_SIZE) {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
    return NextResponse.json({ error: "File exceeds the size limit for uploads without an account." }, { status: 413 });
  }

  const file = await prisma.file.create({
    data: {
      id: fileId,
      filename,
      mimetype,
      size: BigInt(realSize),
      s3Key,
      anonymousSessionId: anonSessionId,
      expiresAt: new Date(Date.now() + ANONYMOUS_FILE_TTL_MS),
    },
  });

  return NextResponse.json({
    id: file.id,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size.toString(),
  });
}
