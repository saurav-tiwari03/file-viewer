import Image from "next/image";
import { ShieldCheck, Zap, Shield, Laptop, Ban, FileType, FileText } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

const FEATURES = [
  { icon: Zap, label: "Instant Access" },
  { icon: Shield, label: "Private & Secure" },
  { icon: Laptop, label: "Works Anywhere" },
  { icon: Ban, label: "No Signup Hassle" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-center gap-10 overflow-hidden bg-linear-to-br from-primary/15 via-primary/5 to-background px-10 py-16 lg:flex">
        <div className="relative flex size-56 items-center justify-center">
          <div className="absolute -left-6 -top-2 flex size-14 items-center justify-center rounded-2xl bg-card shadow-lg">
            <FileType className="size-6 text-primary" />
          </div>
          <div className="absolute -right-8 top-6 flex size-14 items-center justify-center rounded-2xl bg-card shadow-lg">
            <FileText className="size-6 text-primary" />
          </div>
          <div className="absolute -left-10 bottom-2 flex size-14 items-center justify-center rounded-2xl bg-card shadow-lg">
            <Zap className="size-6 text-primary" />
          </div>
          <div className="absolute -right-4 -bottom-4 flex size-14 items-center justify-center rounded-2xl bg-card shadow-lg">
            <Shield className="size-6 text-primary" />
          </div>
          <Image src="/logo.png" alt="FileViewer" width={160} height={160} priority />
        </div>

        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            View any file.
            <br />
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Open PDF and Markdown files directly in your browser. Fast, secure and effortless.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2 text-center">
              <feature.icon className="size-5 text-primary" />
              <p className="text-xs text-muted-foreground">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-6 px-6 py-16">
        <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" />
          100% Secure
        </div>

        <LoginForm />

        <p className="max-w-sm text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
