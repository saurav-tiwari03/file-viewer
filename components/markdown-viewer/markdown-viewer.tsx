import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OutlinePanel } from "./outline-panel";
import { StatusBar } from "./status-bar";
import { extractHeadings } from "@/lib/markdown";
import { Copy, FileText, Maximize2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkdownViewer({ content, size, filename }: { content: string; size: number; filename: string }) {
  const headings = extractHeadings(content);

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/20">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-md border bg-muted/50 p-2 text-primary"><FileText className="size-4" /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{filename}</p>
                <p className="text-xs text-muted-foreground">Markdown <span className="mx-1">•</span> {(size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Button variant="ghost" size="icon-sm" aria-label="Copy document link"><Copy className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Expand reader"><Maximize2 className="size-4" /></Button>
              <span className="hidden border-l px-4 text-sm sm:inline">{content.trim().split(/\s+/).filter(Boolean).length} words</span>
              <Button variant="ghost" size="icon-sm" aria-label="More reader options"><MoreVertical className="size-4" /></Button>
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <article className="prose prose-neutral dark:prose-invert mx-auto max-w-4xl px-8 py-7 lg:px-12">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}
            >
              {content}
            </Markdown>
            </article>
          </ScrollArea>
        </section>
        <aside className="hidden w-76 shrink-0 overflow-hidden rounded-lg border bg-card shadow-sm xl:flex xl:flex-col">
          <div className="flex h-16 shrink-0 items-end gap-8 border-b px-6">
            <span className="border-b-2 border-primary pb-4 text-sm font-medium text-primary">Outline</span>
            <span className="pb-4 text-sm text-muted-foreground">Info</span>
          </div>
          <OutlinePanel headings={headings} />
        </aside>
      </div>
      <StatusBar content={content} size={size} />
    </div>
  );
}
