import { FolderOpen } from "lucide-react";

export function Logo({ size = 24, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <FolderOpen aria-hidden className="shrink-0 text-primary" style={{ width: size, height: size, strokeWidth: 2.4 }} />
      {showWordmark && <span className="text-lg font-semibold tracking-tight">FileViewer</span>}
    </span>
  );
}
