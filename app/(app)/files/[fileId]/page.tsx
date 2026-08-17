import { notFound } from "next/navigation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "@/lib/s3";
import { getAccessibleFile } from "@/lib/files";
import { PdfViewer } from "@/components/pdf-viewer";
import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import { DocxViewer } from "@/components/docx-viewer";
import { FileToolbar } from "@/components/file-toolbar/file-toolbar";
import { isWordMimetype } from "@/lib/definitions";

export default async function FileViewerPage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  const file = await getAccessibleFile(fileId);
  if (!file) notFound();

  return (
    <div className="flex h-full flex-col">
      <FileToolbar fileId={file.id} filename={file.filename} favorite={file.favorite} />
      <div className="min-h-0 flex-1">
        {file.mimetype === "application/pdf" ? (
          <PdfViewer fileId={file.id} filename={file.filename} />
        ) : isWordMimetype(file.mimetype) ? (
          <DocxViewer fileId={file.id} filename={file.filename} size={Number(file.size)} />
        ) : (
          <MarkdownViewerFromS3 s3Key={file.s3Key} size={Number(file.size)} filename={file.filename} />
        )}
      </div>
    </div>
  );
}

async function MarkdownViewerFromS3({ s3Key, size, filename }: { s3Key: string; size: number; filename: string }) {
  const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
  const content = (await obj.Body?.transformToString()) ?? "";
  return <MarkdownViewer content={content} size={size} filename={filename} />;
}
