"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, FileType, Folder, Home, Search, ChevronDown, Plus } from "lucide-react";
import { createFolder } from "@/lib/actions/files";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UploadDialog } from "@/components/app-shell/upload-dialog";
import type { FileListItem } from "./file-row";

type FolderItem = { id: string; name: string };
type Sort = "updatedAt" | "filename" | "size";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ComputerFileManager({ files, folders }: { files: FileListItem[]; folders: FolderItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("updatedAt");
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [pending, startTransition] = useTransition();

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
        await createFolder(folderName);
        setFolderName("");
        setFolderOpen(false);
        toast.success("Folder created.");
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
          <span className="text-muted-foreground">All Files</span>
        </div>

        <div className="grid grid-cols-1 items-center gap-3 pb-6 lg:grid-cols-[minmax(14rem,1fr)_14rem_auto_auto]">
          <label className="relative w-full">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="h-10 rounded-md bg-card pl-11 text-sm shadow-none placeholder:text-muted-foreground" />
          </label>
          <label className="relative">
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="h-10 w-full appearance-none rounded-md border bg-card px-3 pr-9 text-sm font-medium outline-none focus:border-ring">
              <option value="updatedAt">Modified (Newest First)</option>
              <option value="filename">Name (A–Z)</option>
              <option value="size">Size (Largest First)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </label>
          <div className="flex items-center">
            <Button variant="outline" onClick={() => setFolderOpen(true)} className="h-10 rounded-md px-4 text-sm whitespace-nowrap">Create Folder</Button>
          </div>
          <div className="flex items-center">
            <UploadDialog label="Upload File" className="h-10 w-auto rounded-md px-4 text-sm whitespace-nowrap" />
          </div>
        </div>

        <section className="grid grid-cols-[repeat(auto-fill,6.5rem)] gap-x-6 gap-y-8">
          {folders.filter((folder) => folder.name.toLowerCase().includes(query.trim().toLowerCase())).map((folder) => (
            <Link key={folder.id} href={`/folders/${folder.id}`} className="group w-26 text-center">
              <span className="flex aspect-square items-center justify-center rounded-lg border bg-muted/30 transition-colors group-hover:bg-muted"><Folder className="size-14 fill-primary/30 text-primary" /></span>
              <span className="mt-2 block truncate text-sm font-medium">{folder.name}</span>
            </Link>
          ))}
          {visibleFiles.map((file) => {
            const isPdf = file.mimetype === "application/pdf";
            const Icon = isPdf ? FileType : FileText;
            return (
              <Link key={file.id} href={`/files/${file.id}`} className="group w-26 text-center">
                <span className="flex aspect-square items-center justify-center rounded-lg border bg-muted/30 transition-colors group-hover:bg-muted"><Icon className={`size-11 ${isPdf ? "text-red-500" : "text-primary"}`} /></span>
                <span className="mt-2 block">
                  <span className="block truncate text-sm font-medium">{file.filename}</span>
                  <span className="mt-1 block text-xs text-slate-500">{formatBytes(Number(file.size))}</span>
                </span>
              </Link>
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
    </div>
  );
}
