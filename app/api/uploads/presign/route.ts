import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { s3, S3_BUCKET } from "@/lib/s3";
import { prisma } from "@/lib/db";
import { anonymousFileKey, userFileKey } from "@/lib/s3-keys";
import { ensureAnonymousSessionId } from "@/lib/anon-session";
import { getSession } from "@/lib/session";
import { PresignRequestSchema, ANONYMOUS_MAX_FILE_SIZE, hasSupportedExtension } from "@/lib/definitions";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = PresignRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const { filename, mimetype, size } = parsed.data;

  if (!hasSupportedExtension(filename)) {
    return NextResponse.json({ error: "Only .pdf and .md files are supported." }, { status: 400 });
  }

  const session = await getSession();
  const fileId = randomUUID();
  let s3Key: string;

  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 401 });
    }
    if (user.storageUsed + BigInt(size) > user.storageQuota) {
      return NextResponse.json({ error: "This upload would exceed your storage quota." }, { status: 413 });
    }
    s3Key = userFileKey(user.id, user.email, fileId, filename);
  } else {
    if (size > ANONYMOUS_MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds the ${ANONYMOUS_MAX_FILE_SIZE / (1024 * 1024)}MB limit for uploads without an account.` },
        { status: 413 }
      );
    }
    const sessionId = await ensureAnonymousSessionId();
    s3Key = anonymousFileKey(sessionId, fileId, filename);
  }

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: s3Key, ContentType: mimetype }),
    { expiresIn: 300 }
  );

  return NextResponse.json({ uploadUrl, fileId, s3Key });
}
