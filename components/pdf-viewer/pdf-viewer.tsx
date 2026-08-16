"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Uses the browser's PDF renderer rather than evaluating PDF.js in the client
 * bundle. This is more reliable with the current Next/Webpack runtime and
 * still keeps access scoped to the short-lived signed file URL.
 */
export function PdfViewer({ fileId }: { fileId: string }) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/files/${fileId}/view-url`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load file.");
        return res.json() as Promise<{ url: string }>;
      })
      .then(({ url }) => setFileUrl(url))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("This file couldn't be loaded. It may have expired.");
      });

    return () => controller.abort();
  }, [fileId]);

  if (error) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{error}</div>;
  }

  if (!fileUrl) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading PDF…</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/20 p-2">
      <div className="flex h-14 shrink-0 items-center justify-between rounded-t-lg border border-b-0 bg-card px-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4 text-primary" />
          PDF preview
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={fileUrl} download><Download className="size-4" />Download</a>} />
          <Button variant="ghost" size="icon-sm" nativeButton={false} render={<a href={fileUrl} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab"><ExternalLink className="size-4" /></a>} />
        </div>
      </div>
      <iframe
        title="PDF preview"
        src={`${fileUrl}#toolbar=1&navpanes=0`}
        className="min-h-0 w-full flex-1 rounded-b-lg border bg-white shadow-sm"
      />
    </div>
  );
}
