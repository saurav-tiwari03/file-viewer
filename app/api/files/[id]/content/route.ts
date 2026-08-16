import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "@/lib/s3";
import { getAccessibleFile } from "@/lib/files";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getAccessibleFile(id);
  if (!file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: file.s3Key }));
  const text = await obj.Body?.transformToString();

  return new NextResponse(text ?? "", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
