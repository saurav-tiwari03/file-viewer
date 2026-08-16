import Link from "next/link";
import {
  Zap,
  Moon,
  Laptop,
  Upload,
  Eye,
  UserPlus,
  FileText,
  FolderOpen,
  Star,
  Trash2,
  Clock,
  ZoomIn,
  ListTree,
  RotateCw,
  Printer,
  Download,
  Mail,
  ShieldCheck,
  Timer,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { UploadForm } from "@/components/upload/upload-form";
import { getSession } from "@/lib/session";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#organize", label: "Organize" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Fast & Lightweight",
    description: "Files open instantly, right in the browser — no plugins or installs.",
  },
  {
    icon: Moon,
    title: "Focus Mode",
    description: "Full-screen, distraction-free reading for both PDF and Markdown.",
  },
  {
    icon: Laptop,
    title: "Works Anywhere",
    description: "Any modern browser, any device, no software to keep updated.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Default",
    description: "Anonymous uploads are session-scoped and auto-deleted — never public.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Drop your file",
    description: "Drag and drop a PDF or Markdown file, or click to browse. No account needed.",
  },
  {
    icon: Eye,
    title: "View instantly",
    description: "Your file opens right away in a clean, focused viewer built for reading.",
  },
  {
    icon: UserPlus,
    title: "Keep it (optional)",
    description: "Sign in with just your email to save the file, organize it, and come back later.",
  },
];

const PDF_FEATURES = [
  { icon: ZoomIn, label: "Zoom 50%–250%, auto-fit to width" },
  { icon: RotateCw, label: "Rotate pages" },
  { icon: Eye, label: "Page-by-page navigation with jump-to-page" },
  { icon: Printer, label: "Print directly from the viewer" },
  { icon: Download, label: "Download the original file" },
];

const MARKDOWN_FEATURES = [
  { icon: ListTree, label: "Outline panel with scroll-synced headings" },
  { icon: FileText, label: "GitHub-flavored Markdown rendering" },
  { icon: Eye, label: "Live word count, line count, and file size" },
  { icon: Moon, label: "Light and dark reading themes" },
];

const ORGANIZE_FEATURES = [
  {
    icon: FolderOpen,
    title: "Folders",
    description: "Create folders and drag files into them to keep your library organized.",
  },
  {
    icon: Star,
    title: "Favorites",
    description: "Star the files you reach for often so they're always one click away.",
  },
  {
    icon: Clock,
    title: "Recents",
    description: "Your last 20 opened files, sorted automatically — pick up where you left off.",
  },
  {
    icon: Trash2,
    title: "Trash & restore",
    description: "Deleted files go to trash first, so you can restore them before they're gone for good.",
  },
];

const PLANS = [
  {
    name: "Anonymous",
    price: "Free",
    description: "Try it instantly, no signup.",
    features: [
      "Upload files up to 25MB",
      "Full PDF & Markdown viewer",
      "Files auto-delete after your session ends",
      "No account required",
    ],
    cta: { label: "Upload a file", href: "#top" },
  },
  {
    name: "Free account",
    price: "$0",
    description: "For files you want to keep.",
    features: [
      "100MB of permanent storage",
      "Folders, favorites, recents & trash",
      "Sign in from any device with just your email",
      "Files stay private to your account",
    ],
    cta: { label: "Create a free account", href: "/login" },
    highlighted: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    description: "More storage, more control.",
    features: ["Expanded storage quota", "Shareable links", "Priority support"],
    cta: { label: "Notify me", href: "/login", disabled: true },
  },
];

export default async function UploadPage() {
  const session = await getSession();

  return (
    <div id="top" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-8">
          <div className="text-lg">
            <Logo size={28} />
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
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

      <main className="flex flex-1 flex-col items-center gap-24 px-6 py-16">
        <div className="flex w-full max-w-xl flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              View your files <span className="text-primary">instantly</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Open PDF or Markdown files directly in your browser.
              <br />
              No account needed — it&apos;s gone when your session ends.
            </p>
          </div>

          <div className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-card/50 p-10">
            <UploadForm viewBasePath="/view" />
          </div>

          <div className="grid w-full grid-cols-2 gap-4 rounded-xl border bg-card/30 p-4 sm:grid-cols-4">
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
        </div>

        <section id="how-it-works" className="w-full max-w-4xl scroll-mt-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center gap-2 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <step.icon className="size-5 text-primary" />
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="w-full max-w-4xl scroll-mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Built for reading, not just opening</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Purpose-built viewers for each file type, with the tools you actually need.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center rounded-xl border bg-card/30 p-6 text-center">
              <p className="text-sm font-semibold text-primary">PDF Viewer</p>
              <ul className="mt-4 flex flex-col items-center gap-3">
                {PDF_FEATURES.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <item.icon className="size-4 shrink-0 text-primary" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center rounded-xl border bg-card/30 p-6 text-center">
              <p className="text-sm font-semibold text-primary">Markdown Viewer</p>
              <ul className="mt-4 flex flex-col items-center gap-3">
                {MARKDOWN_FEATURES.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <item.icon className="size-4 shrink-0 text-primary" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="organize" className="w-full max-w-4xl scroll-mt-20 rounded-xl border bg-card/30 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">More with a free account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No credit card required. Just a home for the files you want to keep.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ORGANIZE_FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center gap-1.5 text-center">
                <feature.icon className="size-5 text-primary" />
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button nativeButton={false} render={<Link href="/login" />}>
              Create a free account
            </Button>
          </div>
        </section>

        <section className="w-full max-w-4xl scroll-mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in without a password</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Just your email — no passwords to remember or forget.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/30 p-5 text-center">
              <Mail className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Email one-time code</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We send a 6-digit code to your inbox — enter it and you&apos;re in. Nothing to remember.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/30 p-5 text-center">
              <Timer className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Session lasts 30 days</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Stay signed in across visits on any device, and sign out any time from settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full max-w-5xl scroll-mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with nothing to lose. Upgrade only if you need more room.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col items-center rounded-xl border p-6 text-center ${
                  plan.highlighted ? "border-primary bg-primary/5" : "bg-card/30"
                }`}
              >
                <p className="text-sm font-semibold">{plan.name}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{plan.price}</p>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                <ul className="mt-5 flex flex-1 flex-col items-center gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.cta.disabled ? (
                  <Button className="mt-6" variant="outline" disabled>
                    {plan.cta.label}
                  </Button>
                ) : (
                  <Button
                    className="mt-6"
                    variant={plan.highlighted ? "default" : "outline"}
                    nativeButton={false}
                    render={<Link href={plan.cta.href} />}
                  >
                    {plan.cta.label}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="w-full max-w-2xl scroll-mt-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">About</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This viewer is built for one job: opening PDF and Markdown files fast, without friction.
            Try it anonymously with nothing to install and nothing left behind, or create a free
            account to build a small, organized library of the files you care about.
          </p>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        <p>Supports PDF and Markdown files. No account required to get started.</p>
      </footer>
    </div>
  );
}
