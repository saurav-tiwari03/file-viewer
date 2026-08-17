"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, FileType, Folder, Home, Search, ChevronDown, Plus, MoreHorizontal, ArrowRight, Pencil, Download, Trash2, Info } from "lucide-react";
import { createFolder, moveToFolder, moveFolder, renameFile, renameFolder, deleteFolder, moveToTrash } from "@/lib/actions/files";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UploadDialog } from "@/components/app-shell/upload-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileListItem } from "./file-row";

type FolderItem = { id: string; name: string; parentId?: string | null; createdAt?: string; fileCount?: number };
type Sort = "updatedAt" | "filename" | "size";

const SORT_LABELS: Record<Sort, string> = {
  updatedAt: "Modified (Newest First)",
  filename: "Name (A–Z)",
  size: "Size (Largest First)",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileType(mimetype: string) {
  if (mimetype === "application/pdf") return "PDF document";
  if (mimetype.includes("markdown")) return "Markdown file";
  return "Document";
}

type InfoTarget = { kind: "file"; file: FileListItem } | { kind: "folder"; folder: FolderItem };
type MoveTarget = { kind: "file"; file: FileListItem } | { kind: "folder"; folder: FolderItem };

export function ComputerFileManager({
  files,
  folders,
  allFolders,
  currentFolder,
  ancestors,
}: {
  files: FileListItem[];
  folders: FolderItem[];
  allFolders?: FolderItem[];
  currentFolder?: FolderItem;
  ancestors?: FolderItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("updatedAt");
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [pending, startTransition] = useTransition();
  const [draggingFileId, setDraggingFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState("");

  const [infoTarget, setInfoTarget] = useState<InfoTarget | null>(null);

  const moveOptions = (allFolders ?? folders).filter((folder) => {
    if (!moveTarget) return true;
    if (moveTarget.kind === "file") return folder.id !== moveTarget.file.folderId;
    return folder.id !== moveTarget.folder.id;
  });

  const run = (action: () => Promise<void>, successMessage?: string) => {
    startTransition(async () => {
      try {
        await action();
        if (successMessage) toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  };

  const dropFileOnFolder = (fileId: string, folderId: string) => run(() => moveToFolder(fileId, folderId), "File moved.");

  const startRenameFile = (file: FileListItem) => {
    setRenamingFileId(file.id);
    setRenameDraft(file.filename);
  };
  const startRenameFolder = (folder: FolderItem) => {
    setRenamingFolderId(folder.id);
    setRenameDraft(folder.name);
  };
  const commitRenameFile = (file: FileListItem) => {
    setRenamingFileId(null);
    if (renameDraft.trim() && renameDraft !== file.filename) run(() => renameFile(file.id, renameDraft), "Renamed.");
  };
  const commitRenameFolder = (folder: FolderItem) => {
    setRenamingFolderId(null);
    if (renameDraft.trim() && renameDraft !== folder.name) run(() => renameFolder(folder.id, renameDraft), "Renamed.");
  };

  const openMoveFile = (file: FileListItem) => {
    setMoveTarget({ kind: "file", file });
    setMoveTargetFolderId("");
  };
  const openMoveFolder = (folder: FolderItem) => {
    setMoveTarget({ kind: "folder", folder });
    setMoveTargetFolderId("");
  };
  const submitMove = () => {
    if (!moveTarget || !moveTargetFolderId) return;
    if (moveTarget.kind === "file") {
      const file = moveTarget.file;
      run(() => moveToFolder(file.id, moveTargetFolderId), "File moved.");
    } else {
      const folder = moveTarget.folder;
      const parentId = moveTargetFolderId === "__root__" ? null : moveTargetFolderId;
      run(() => moveFolder(folder.id, parentId), "Folder moved.");
    }
    setMoveTarget(null);
  };

  const deleteFileCard = (file: FileListItem) => run(() => moveToTrash(file.id), "Moved to trash.");
  const deleteFolderCard = (folder: FolderItem) => {
    if (!window.confirm(`Delete "${folder.name}"? Files inside will move back to All Files, and any subfolders will be deleted too.`)) return;
    run(() => deleteFolder(folder.id), "Folder deleted.");
  };

  const visibleFiles = useMemo(() => files
    .filter((file) => file.filename.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "filename") return a.filename.localeCompare(b.filename);
      if (sort === "size") return Number(b.size) - Number(a.size);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }), [files, query, sort]);

  const submitFolder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await createFolder(folderName, currentFolder?.id);
        setFolderName("");
        setFolderOpen(false);
        toast.success("Folder created.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create folder.");
      }
    });
  };

  return (
    <div className="h-full overflow-auto bg-background text-foreground">
      <main className="min-h-full px-5 py-5 sm:px-8 sm:py-6">
        <header className="border-b pb-5">
          <h1 className="text-base font-bold tracking-tight">FILES</h1>
        </header>

        <div className="flex items-center gap-2 py-4 text-sm">
          <Home className="size-4 text-muted-foreground" />
          {currentFolder ? (
            <>
              <Link href="/files" className="text-muted-foreground hover:text-foreground">All Files</Link>
              {(ancestors ?? []).map((ancestor) => (
                <span key={ancestor.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground">/</span>
                  <Link href={`/folders/${ancestor.id}`} className="text-muted-foreground hover:text-foreground">{ancestor.name}</Link>
                </span>
              ))}
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{currentFolder.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">All Files</span>
          )}
        </div>

        <div className="grid grid-cols-1 items-center gap-3 pb-6 lg:grid-cols-[minmax(14rem,1fr)_14rem_auto_auto]">
          <label className="relative w-full">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="h-10 rounded-md bg-card pl-11 text-sm shadow-none placeholder:text-muted-foreground" />
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="h-10 w-full justify-between rounded-md px-3 text-sm font-medium" />}>
              {SORT_LABELS[sort]}
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {(Object.keys(SORT_LABELS) as Sort[]).map((option) => (
                <DropdownMenuCheckboxItem key={option} checked={sort === option} onCheckedChange={() => setSort(option)}>
                  {SORT_LABELS[option]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center">
            <Button variant="outline" onClick={() => setFolderOpen(true)} className="h-10 rounded-md px-4 text-sm whitespace-nowrap">Create Folder</Button>
          </div>
          <div className="flex items-center">
            <UploadDialog label="Upload File" className="h-10 w-auto rounded-md px-4 text-sm whitespace-nowrap" folderId={currentFolder?.id} />
          </div>
        </div>

        <section className="grid grid-cols-[repeat(auto-fill,6.5rem)] gap-x-6 gap-y-8">
          {folders.filter((folder) => folder.name.toLowerCase().includes(query.trim().toLowerCase())).map((folder) => (
            <div
              key={folder.id}
              className="group relative w-26 text-center"
              onDragOver={(event) => {
                if (!draggingFileId) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDragEnter={(event) => {
                if (!draggingFileId) return;
                event.preventDefault();
                setDragOverFolderId(folder.id);
              }}
              onDragLeave={() => setDragOverFolderId((current) => (current === folder.id ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverFolderId(null);
                const fileId = event.dataTransfer.getData("text/plain");
                if (fileId) dropFileOnFolder(fileId, folder.id);
              }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="icon-xs" />}
                  className="absolute top-0 right-0 z-10 rounded-full bg-card opacity-0 shadow-sm focus-visible:opacity-100 group-hover:opacity-100 data-popup-open:opacity-100"
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openMoveFolder(folder)}>
                    <ArrowRight className="size-4" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => startRenameFolder(folder)}>
                    <Pencil className="size-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setInfoTarget({ kind: "folder", folder })}>
                    <Info className="size-4" />
                    Info
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => deleteFolderCard(folder)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href={`/folders/${folder.id}`} className="block">
                <span className={`flex aspect-square items-center justify-center rounded-lg border bg-muted/30 transition-colors group-hover:bg-muted ${dragOverFolderId === folder.id ? "border-primary bg-primary/10" : ""}`}>
                  <Folder className="size-14 fill-primary/30 text-primary" />
                </span>
              </Link>
              {renamingFolderId === folder.id ? (
                <input
                  autoFocus
                  value={renameDraft}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  onBlur={() => commitRenameFolder(folder)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                      setRenamingFolderId(null);
                    }
                  }}
                  className="mt-2 w-full rounded border bg-background px-1 text-center text-sm outline-none"
                />
              ) : (
                <span className="mt-2 block truncate text-sm font-medium">{folder.name}</span>
              )}
            </div>
          ))}
          {visibleFiles.map((file) => {
            const isPdf = file.mimetype === "application/pdf";
            const Icon = isPdf ? FileType : FileText;
            return (
              <div
                key={file.id}
                className={`group relative w-26 text-center ${draggingFileId === file.id ? "opacity-50" : ""}`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", file.id);
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingFileId(file.id);
                }}
                onDragEnd={() => {
                  setDraggingFileId(null);
                  setDragOverFolderId(null);
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="outline" size="icon-xs" />}
                    className="absolute top-0 right-0 z-10 rounded-full bg-card opacity-0 shadow-sm focus-visible:opacity-100 group-hover:opacity-100 data-popup-open:opacity-100"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openMoveFile(file)}>
                      <ArrowRight className="size-4" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startRenameFile(file)}>
                      <Pencil className="size-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<a href={`/api/files/${file.id}/download`} />}
                    >
                      <Download className="size-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setInfoTarget({ kind: "file", file })}>
                      <Info className="size-4" />
                      Info
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => deleteFileCard(file)}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href={`/files/${file.id}`} className="block">
                  <span className="flex aspect-square items-center justify-center rounded-lg border bg-muted/30 transition-colors group-hover:bg-muted"><Icon className={`size-11 ${isPdf ? "text-red-500" : "text-primary"}`} /></span>
                </Link>
                {renamingFileId === file.id ? (
                  <input
                    autoFocus
                    value={renameDraft}
                    onChange={(event) => setRenameDraft(event.target.value)}
                    onBlur={() => commitRenameFile(file)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                      if (event.key === "Escape") {
                        setRenamingFileId(null);
                      }
                    }}
                    className="mt-2 w-full rounded border bg-background px-1 text-center text-sm outline-none"
                  />
                ) : (
                  <span className="mt-2 block">
                    <span className="block truncate text-sm font-medium">{file.filename}</span>
                    <span className="mt-1 block text-xs text-slate-500">{formatBytes(Number(file.size))}</span>
                  </span>
                )}
              </div>
            );
          })}
        </section>
        {folders.length === 0 && visibleFiles.length === 0 && <p className="pt-8 text-lg text-muted-foreground">No files or folders found.</p>}
      </main>

      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create folder</DialogTitle><DialogDescription>Give your new folder a name.</DialogDescription></DialogHeader>
          <form onSubmit={submitFolder}>
            <Input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Folder name" />
            <DialogFooter className="mt-4"><Button type="submit" disabled={pending || !folderName.trim()}><Plus />Create folder</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={moveTarget !== null} onOpenChange={(open) => !open && setMoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move To a Folder</DialogTitle>
            <DialogDescription>
              Choose where to move &ldquo;{moveTarget?.kind === "file" ? moveTarget.file.filename : moveTarget?.folder.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="h-10 w-full justify-between rounded-md px-3 text-sm font-medium" />}>
              {moveOptions.find((folder) => folder.id === moveTargetFolderId)?.name ?? "Choose a folder"}
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full">
              {moveTarget?.kind === "folder" && (
                <DropdownMenuCheckboxItem checked={moveTargetFolderId === "__root__"} onCheckedChange={() => setMoveTargetFolderId("__root__")}>
                  All Files (top level)
                </DropdownMenuCheckboxItem>
              )}
              {moveOptions.map((folder) => (
                <DropdownMenuCheckboxItem key={folder.id} checked={moveTargetFolderId === folder.id} onCheckedChange={() => setMoveTargetFolderId(folder.id)}>
                  {folder.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {moveOptions.length === 0 && moveTarget?.kind === "file" && (
            <p className="text-xs text-muted-foreground">No other folders yet — create one first.</p>
          )}
          <DialogFooter className="mt-4">
            <Button type="button" disabled={pending || !moveTargetFolderId} onClick={submitMove}>
              <ArrowRight />
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={infoTarget !== null} onOpenChange={(open) => !open && setInfoTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoTarget?.kind === "file" ? infoTarget.file.filename : infoTarget?.kind === "folder" ? infoTarget.folder.name : "Info"}</DialogTitle>
          </DialogHeader>
          {infoTarget?.kind === "file" && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Type</dt>
              <dd>{fileType(infoTarget.file.mimetype)}</dd>
              <dt className="text-muted-foreground">Size</dt>
              <dd>{formatBytes(Number(infoTarget.file.size))}</dd>
              <dt className="text-muted-foreground">Favorite</dt>
              <dd>{infoTarget.file.favorite ? "Yes" : "No"}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(infoTarget.file.createdAt).toLocaleString()}</dd>
              <dt className="text-muted-foreground">Modified</dt>
              <dd>{new Date(infoTarget.file.updatedAt).toLocaleString()}</dd>
            </dl>
          )}
          {infoTarget?.kind === "folder" && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{infoTarget.folder.fileCount ?? 0} file{infoTarget.folder.fileCount === 1 ? "" : "s"}</dd>
              {infoTarget.folder.createdAt && (
                <>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{new Date(infoTarget.folder.createdAt).toLocaleString()}</dd>
                </>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
