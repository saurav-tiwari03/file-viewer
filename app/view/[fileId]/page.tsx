import { notFound } from "next/navigation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "@/lib/s3";
import { getAccessibleFile } from "@/lib/files";
import { triggerLazyCleanup } from "@/lib/cleanup";
import { PdfViewer } from "@/components/pdf-viewer";
import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Upload } from "lucide-react";

export default async function AnonymousViewPage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  triggerLazyCleanup();

  const file = await getAccessibleFile(fileId);
  if (!file) notFound();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{file.filename}</p>
          <p className="text-xs text-muted-foreground">
            This file is temporary and will be removed after your session ends.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a href={`/api/files/${file.id}/download`}>
                <Download className="size-4" />
                Download
              </a>
            }
          />
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/upload">
                <Upload className="size-4" />
                Upload another
              </Link>
            }
          />
        </div>
      </header>
      <main className="min-h-0 flex-1">
        {file.mimetype === "application/pdf" ? (
          <PdfViewer fileId={file.id} />
        ) : (
          <MarkdownViewerFromS3 s3Key={file.s3Key} size={Number(file.size)} filename={file.filename} />
        )}
      </main>
    </div>
  );
}

async function MarkdownViewerFromS3({ s3Key, size, filename }: { s3Key: string; size: number; filename: string }) {
  const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
  const content = (await obj.Body?.transformToString()) ?? "";
  return <MarkdownViewer content={content} size={size} filename={filename} />;
}
