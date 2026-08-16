import Link from "next/link";
import { Shield, Zap, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { UploadForm } from "@/components/upload/upload-form";
import { getSession } from "@/lib/session";

const FEATURES = [
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your files never leave your device. Everything is local.",
  },
  {
    icon: Zap,
    title: "Fast & Lightweight",
    description: "Built for speed and a seamless reading experience.",
  },
  {
    icon: Moon,
    title: "Focus Mode",
    description: "Distraction-free interface for better reading.",
  },
  {
    icon: Laptop,
    title: "Works Anywhere",
    description: "Open files on any device and any modern browser.",
  },
];

export default async function UploadPage() {
  const session = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="text-lg">
          <Logo size={28} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <Button variant="outline" nativeButton={false} render={<Link href="/files" />}>
              Continue to dashboard
            </Button>
          ) : (
            <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
              Sign in / Sign up
            </Button>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-12 px-6 py-16">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            View your files <span className="text-primary">instantly</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Open PDF or Markdown files directly in your browser.
            <br />
            No account needed — it&apos;s gone when your session ends.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-2xl border-2 border-dashed border-primary/40 bg-card/50 p-10">
          <UploadForm viewBasePath="/view" />
        </div>

        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 rounded-xl border bg-card/30 p-4 sm:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-1.5 p-2">
              <feature.icon className="size-5 text-primary" />
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Want your files to stick around?{" "}
          <Link href="/login" className="font-medium text-primary underline underline-offset-4">
            Create a free account
          </Link>{" "}
          for 100MB of permanent storage.
        </p>
      </main>
    </div>
  );
}
