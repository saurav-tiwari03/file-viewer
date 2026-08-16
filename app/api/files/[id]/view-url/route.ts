import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET } from "@/lib/s3";
import { getAccessibleFile } from "@/lib/files";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getAccessibleFile(id);
  if (!file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: file.s3Key }), {
    expiresIn: 300,
  });

  return NextResponse.json({ url });
}
