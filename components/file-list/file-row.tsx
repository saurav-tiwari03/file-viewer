"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { FileText, FileType, Star, Trash2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite, moveToTrash, restoreFromTrash, permanentlyDeleteFile } from "@/lib/actions/files";

export type FileListItem = {
  id: string;
  filename: string;
  mimetype: string;
  size: string;
  favorite: boolean;
  trashed: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileType(mimetype: string) {
  if (mimetype === "application/pdf") return "PDF document";
  if (mimetype.includes("markdown")) return "Markdown file";
  return "Document";
}

export function FileRow({ file }: { file: FileListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>, successMessage?: string) => {
    startTransition(async () => {
      try {
        await action();
        if (successMessage) toast.success(successMessage);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  const Icon = file.mimetype === "application/pdf" ? FileType : FileText;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_8rem_5rem] items-center px-4 transition-colors hover:bg-primary/5 sm:grid-cols-[minmax(0,1fr)_9rem_9rem_7rem_5rem]">
      <Link href={`/files/${file.id}`} className="flex min-w-0 items-center gap-3 py-3">
        <span className={`rounded-md p-2 ${file.mimetype === "application/pdf" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300"}`}><Icon className="size-5" /></span>
        <p className="truncate text-sm font-medium">{file.filename}</p>
      </Link>
      <p className="hidden truncate text-sm text-muted-foreground sm:block">{fileType(file.mimetype)}</p>
      <p className="truncate text-sm text-muted-foreground">{new Date(file.updatedAt).toLocaleDateString("en-US")}</p>
      <p className="hidden text-right text-sm text-muted-foreground sm:block">{formatBytes(Number(file.size))}</p>
      <div className="flex shrink-0 items-center gap-1">
        {file.trashed ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={() => run(() => restoreFromTrash(file.id), "Restored.")}
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={() => run(() => permanentlyDeleteFile(file.id), "Deleted forever.")}
            >
              <XCircle className="size-4 text-destructive" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={() => run(() => toggleFavorite(file.id))}
            >
              <Star className={`size-4 ${file.favorite ? "fill-current text-yellow-500" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={() => run(() => moveToTrash(file.id), "Moved to trash.")}
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
