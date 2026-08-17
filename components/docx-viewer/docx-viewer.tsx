"use client";

import { useEffect, useState } from "react";
import { Copy, Download, FileText, Maximize2, Minimize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function DocxViewer({ fileId, filename, size }: { fileId: string; filename: string; size: number }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [mammoth, res] = await Promise.all([
          import("mammoth/mammoth.browser"),
          fetch(`/api/files/${fileId}/content`),
        ]);
        if (!res.ok) throw new Error("Could not load this file.");
        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) setHtml(result.value);
      } catch {
        if (!cancelled) setError("This document couldn't be previewed. It may use the older .doc format, which isn't supported for in-browser preview — try downloading it instead.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  useEffect(() => {
    if (!isFullscreen) return;
    const exitOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", exitOnEscape);
    return () => document.removeEventListener("keydown", exitOnEscape);
  }, [isFullscreen]);

  return (
    <div className={`flex h-full min-h-0 flex-col bg-muted/20 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      <div className="flex min-h-0 flex-1 p-1 sm:p-2">
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 sm:h-16 sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="hidden rounded-md border bg-muted/50 p-2 text-primary sm:block"><FileText className="size-4" /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{filename}</p>
                <p className="text-xs text-muted-foreground">Word document <span className="mx-1">•</span> {(size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
              <Button variant="outline" size="sm" nativeButton={false} render={<a href={`/api/files/${fileId}/download`}><Download className="size-3.5" /><span className="hidden sm:inline">Download</span></a>} />
              <Button variant="ghost" size="icon-sm" aria-label="Copy document link" className="hidden sm:inline-flex"><Copy className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setIsFullscreen((current) => !current)} aria-label={isFullscreen ? "Collapse reader" : "Expand reader"}>{isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</Button>
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            {error ? (
              <div className="flex h-full items-center justify-center px-6 py-16 text-center text-sm text-muted-foreground">{error}</div>
            ) : html === null ? (
              <div className="flex h-full items-center justify-center py-16 text-sm text-muted-foreground">Loading document…</div>
            ) : (
              <article
                className="prose prose-neutral dark:prose-invert mx-auto max-w-4xl px-4 py-5 sm:px-8 sm:py-7 lg:px-12"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </ScrollArea>
        </section>
      </div>
    </div>
  );
}
