"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Download, FileText, Maximize2, Minimize2, Minus, Plus, Printer, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// This local worker keeps rendering and controls inside FileViewer.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;

export function PdfViewer({ fileId, filename = "PDF document" }: { fileId: string; filename?: string }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;
    const updateWidth = () => setContainerWidth(element.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const exitOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", exitOnEscape);
    return () => document.removeEventListener("keydown", exitOnEscape);
  }, [isFullscreen]);

  const goToPage = useCallback((nextPage: number) => {
    setPageNumber(Math.max(1, Math.min(numPages || 1, nextPage)));
  }, [numPages]);

  const changeZoom = (amount: number) => setScale((current) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number((current + amount).toFixed(2)))));
  const toggleFullscreen = () => setIsFullscreen((current) => !current);
  const pageWidth = containerWidth ? Math.min(containerWidth - 48, 1000) * scale : undefined;

  if (error) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{error}</div>;

  return (
    <section
      ref={viewerRef}
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-muted/30 p-2 sm:p-3 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <div className="flex min-h-12 shrink-0 items-center justify-between gap-2 rounded-t-xl border border-b-0 bg-card px-2 shadow-sm sm:min-h-14 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm"><span className="rounded-md bg-primary/10 p-1.5 text-primary"><FileText className="size-4" /></span><span className="truncate font-medium">{filename}</span><span className="hidden text-muted-foreground sm:inline">PDF preview</span></div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={`/api/files/${fileId}/download`}><Download className="size-3.5" /><span className="hidden sm:inline">Download</span></a>} />
          <Button variant="ghost" size="icon-sm" onClick={() => window.print()} aria-label="Print PDF" className="hidden sm:inline-flex"><Printer className="size-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit full screen" : "Open full screen"}>{isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</Button>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-start gap-1 overflow-x-auto border bg-card px-2 py-2 shadow-sm sm:justify-center sm:gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} aria-label="Previous page" className="shrink-0"><ChevronLeft className="size-4" /></Button>
        <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground sm:text-sm"><input aria-label="Current page" type="number" min={1} max={numPages || 1} value={pageNumber} onChange={(event) => goToPage(Number(event.target.value))} className="h-7 w-10 shrink-0 rounded border bg-background text-center text-foreground outline-none focus:ring-2 focus:ring-ring/50" /><span>/ {numPages || "—"}</span></label>
        <Button variant="ghost" size="icon-sm" onClick={() => goToPage(pageNumber + 1)} disabled={!numPages || pageNumber >= numPages} aria-label="Next page" className="shrink-0"><ChevronRight className="size-4" /></Button>
        <span className="mx-1 h-5 shrink-0 border-l" />
        <Button variant="ghost" size="icon-sm" onClick={() => changeZoom(-ZOOM_STEP)} disabled={scale <= MIN_ZOOM} aria-label="Zoom out" className="shrink-0"><Minus className="size-4" /></Button>
        <button type="button" onClick={() => setScale(1)} className="h-7 min-w-14 shrink-0 rounded px-1 text-xs font-medium hover:bg-muted sm:text-sm" aria-label="Reset zoom">{Math.round(scale * 100)}%</button>
        <Button variant="ghost" size="icon-sm" onClick={() => changeZoom(ZOOM_STEP)} disabled={scale >= MAX_ZOOM} aria-label="Zoom in" className="shrink-0"><Plus className="size-4" /></Button>
        <span className="mx-1 h-5 shrink-0 border-l" />
        <Button variant="ghost" size="icon-sm" onClick={() => setRotation((current) => (current + 90) % 360)} aria-label="Rotate clockwise" className="shrink-0"><RotateCw className="size-4" /></Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto border border-t-0 bg-neutral-200 p-4 dark:bg-neutral-900 sm:p-6">
        <div className="flex min-h-full min-w-max justify-center" data-testid="pdf-canvas-container">
          <Document file={`/api/files/${fileId}/content`} loading={<div className="mt-12 text-sm text-muted-foreground">Loading PDF…</div>} onLoadSuccess={({ numPages: loadedPages }) => { setNumPages(loadedPages); setPageNumber((current) => Math.min(current, loadedPages)); }} onLoadError={() => setError("This file couldn't be loaded. It may have expired.")}>
            <Page pageNumber={pageNumber} width={pageWidth} rotate={rotation} renderAnnotationLayer={false} renderTextLayer={false} loading={<div className="mt-12 text-sm text-muted-foreground">Rendering page…</div>} className="shadow-xl" />
          </Document>
        </div>
      </div>
    </section>
  );
}
