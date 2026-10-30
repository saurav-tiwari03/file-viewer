import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Page not found · FileViewer",
  description: "That page or file doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/upload" aria-label="FileViewer home">
          <Logo size={28} />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-primary">
          <FileQuestion aria-hidden className="size-8" />
        </div>
        <p className="mt-6 text-sm font-medium tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">We can&apos;t find that page</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The link may be wrong, or the file may have been deleted. Files opened without an account are removed after your
          session ends.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/upload" />}>
            Open a file
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/files" />}>
            Go to my files
          </Button>
        </div>
      </main>
    </div>
  );
}
