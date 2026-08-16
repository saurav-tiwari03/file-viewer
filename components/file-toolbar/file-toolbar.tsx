"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star, Share2, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleFavorite, moveToTrash, renameFile } from "@/lib/actions/files";

export function FileToolbar({
  fileId,
  filename,
  favorite,
}: {
  fileId: string;
  filename: string;
  favorite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(filename);

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

  return (
    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-4 py-2 sm:min-h-20 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/files">All Files</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            {renaming ? (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  setRenaming(false);
                  if (name.trim() && name !== filename) run(() => renameFile(fileId, name), "Renamed.");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    setName(filename);
                    setRenaming(false);
                  }
                }}
                className="w-full max-w-xs rounded border bg-background px-1 text-sm outline-none"
              />
            ) : (
              <BreadcrumbPage className="truncate">{filename}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => toggleFavorite(fileId))}>
          <Star className={`size-4 ${favorite ? "fill-current text-yellow-500" : ""}`} />
          <span className="hidden sm:inline">Favorite</span>
        </Button>
        <Button variant="outline" size="sm" disabled title="Sharing isn't available yet" className="hidden sm:inline-flex">
          <Share2 className="size-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a href={`/api/files/${fileId}/download`}>
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="sm:hidden" disabled>
              <Share2 className="size-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => run(() => moveToTrash(fileId).then(() => router.push("/files")), "Moved to trash.")}
            >
              <Trash2 className="size-4" />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
