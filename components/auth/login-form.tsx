"use client";

import { useActionState } from "react";
import { requestOtpAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send, Lock, ShieldCheck, Zap } from "lucide-react";

const WHY_ITEMS = [
  { icon: Lock, label: "No password\nto remember" },
  { icon: ShieldCheck, label: "More secure\nby design" },
  { icon: Zap, label: "One-click\nand done" },
];

export function LoginForm() {
  const [state, action, pending] = useActionState(requestOtpAction, undefined);

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">Sign in to continue</h1>
      <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a 6-digit code. No password needed.</p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoFocus
              className="pl-9"
            />
          </div>
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          <Send className="size-4" />
          {pending ? "Sending code…" : "Send code"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">Why email sign in?</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {WHY_ITEMS.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <item.icon className="size-4 text-primary" />
            </div>
            <p className="whitespace-pre-line text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
