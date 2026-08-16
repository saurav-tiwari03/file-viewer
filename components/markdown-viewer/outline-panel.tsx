"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Heading } from "@/lib/markdown";

export function OutlinePanel({ headings }: { headings: Heading[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null);

    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSlug(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No headings found.</div>;
  }

  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col gap-1 p-4 text-sm">
        {headings.map((h) => (
          <a
            key={h.slug}
            href={`#${h.slug}`}
            style={{ paddingLeft: `${(h.depth - 1) * 12}px` }}
            className={`truncate rounded px-2 py-1 transition-colors hover:bg-accent ${
              activeSlug === h.slug ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </ScrollArea>
  );
}
