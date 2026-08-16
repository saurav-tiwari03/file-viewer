"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ChevronDown, FolderOpen, LayoutList } from "lucide-react";
import { FileRow, type FileListItem } from "./file-row";

type SortKey = "filename" | "updatedAt" | "size";

export function FileGrid({ files, emptyMessage }: { files: FileListItem[]; emptyMessage: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("filename");
  const [descending, setDescending] = useState(false);

  const sortedFiles = useMemo(() => [...files].sort((a, b) => {
    const aValue = sortKey === "size" ? Number(a.size) : sortKey === "updatedAt" ? new Date(a.updatedAt).getTime() : a.filename.toLocaleLowerCase();
    const bValue = sortKey === "size" ? Number(b.size) : sortKey === "updatedAt" ? new Date(b.updatedAt).getTime() : b.filename.toLocaleLowerCase();
    const result = typeof aValue === "string" && typeof bValue === "string" ? aValue.localeCompare(bValue) : Number(aValue) - Number(bValue);
    return descending ? -result : result;
  }), [descending, files, sortKey]);

  const selectSort = (key: SortKey) => {
    if (key === sortKey) setDescending((current) => !current);
    else {
      setSortKey(key);
      setDescending(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <FolderOpen className="size-10 stroke-1" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className="h-full overflow-auto bg-background p-5">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-5 text-primary" />
            <h1 className="font-semibold">Files</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{files.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><LayoutList className="size-4" /> Details</div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_8rem_5rem] items-center border-b bg-muted/35 px-4 text-xs font-medium text-muted-foreground sm:grid-cols-[minmax(0,1fr)_9rem_9rem_7rem_5rem]">
          <button className="flex h-9 items-center gap-1 text-left hover:text-foreground" onClick={() => selectSort("filename")}>Name {sortKey === "filename" && <ArrowDownAZ className={`size-3.5 ${descending ? "rotate-180" : ""}`} />}</button>
          <span className="hidden sm:block">Type</span>
          <button className="flex h-9 items-center gap-1 text-left hover:text-foreground" onClick={() => selectSort("updatedAt")}>Modified {sortKey === "updatedAt" && <ChevronDown className={`size-3.5 ${descending ? "rotate-180" : ""}`} />}</button>
          <button className="hidden h-9 items-center gap-1 text-right sm:flex sm:justify-end hover:text-foreground" onClick={() => selectSort("size")}>Size {sortKey === "size" && <ChevronDown className={`size-3.5 ${descending ? "rotate-180" : ""}`} />}</button>
          <span />
        </div>
        <div className="divide-y">
          {sortedFiles.map((file) => (
        <FileRow key={file.id} file={file} />
          ))}
        </div>
      </div>
    </section>
  );
}
