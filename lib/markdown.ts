export type Heading = { depth: number; text: string; slug: string };

/** Mirrors github-slugger/rehype-slug's slugging so anchors line up with rendered ids. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  for (const line of markdown.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length;
    const text = match[2].trim();
    let slug = slugify(text);

    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count}`;

    headings.push({ depth, text, slug });
  }

  return headings;
}

export function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function countLines(text: string) {
  return text.length ? text.split("\n").length : 0;
}
