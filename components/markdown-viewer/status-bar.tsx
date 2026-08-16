import { countLines, countWords } from "@/lib/markdown";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StatusBar({ content, size }: { content: string; size: number }) {
  return (
    <div className="flex items-center gap-4 border-t bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
      <span>Lines {countLines(content)}</span>
      <span>Words {countWords(content)}</span>
      <span>{formatBytes(size)}</span>
      <span className="rounded bg-muted px-1.5 py-0.5 font-medium uppercase">Markdown</span>
    </div>
  );
}
