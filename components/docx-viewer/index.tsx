"use client";

import dynamic from "next/dynamic";

export const DocxViewer = dynamic(() => import("./docx-viewer").then((m) => m.DocxViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading document…</div>,
});
