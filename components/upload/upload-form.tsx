"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUp, FileText, FileType, FolderOpen } from "lucide-react";
import { toast } from "sonner";

function mimetypeForFilename(
  filename: string
):
  | "application/pdf"
  | "text/markdown"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".doc")) return "application/msword";
  return null;
}

export function UploadForm({
  viewBasePath = "/view",
  bordered = false,
  folderId,
}: {
  viewBasePath?: string;
  bordered?: boolean;
  folderId?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      const mimetype = mimetypeForFilename(file.name);
      if (!mimetype) {
        toast.error("Only .pdf, .md, .doc, and .docx files are supported.");
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mimetype, size: file.size }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Could not start the upload.");
        }

        const { uploadUrl, fileId, s3Key } = await presignRes.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", mimetype);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed.")));
          xhr.onerror = () => reject(new Error("Upload failed."));
          xhr.send(file);
        });

        const completeRes = await fetch(`/api/uploads/${fileId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key, filename: file.name, mimetype, folderId }),
        });

        if (!completeRes.ok) {
          const data = await completeRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Could not finish the upload.");
        }

        const result = await completeRes.json();
        router.push(`${viewBasePath}/${result.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
        setUploading(false);
        setProgress(null);
      }
    },
    [router, viewBasePath, folderId]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      className={`flex w-full max-w-md flex-col items-center gap-4 text-center transition-colors ${
        bordered ? "rounded-2xl border-2 border-dashed p-10" : ""
      } ${dragActive ? (bordered ? "border-primary bg-primary/5" : "opacity-80") : bordered ? "border-border" : ""}`}
    >
      {uploading ? (
        <div className="flex w-full flex-col items-center gap-3">
          <FileUp className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading…</p>
          <Progress value={progress ?? 0} className="w-full" />
        </div>
      ) : (
        <>
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <FileUp className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold">Drag and drop a file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileType className="size-3.5 text-primary" /> PDF
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <FileText className="size-3.5 text-primary" /> Markdown
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <FileText className="size-3.5 text-primary" /> Word
            </span>
          </div>
          <Button onClick={() => inputRef.current?.click()} className="mt-2">
            <FolderOpen className="size-4" />
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.md,.doc,.docx,application/pdf,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </>
      )}
    </div>
  );
}
