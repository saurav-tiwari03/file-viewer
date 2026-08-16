"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, Clock, Lock, ArrowRight } from "lucide-react";
import { verifyOtpAction, resendOtpAction } from "@/lib/actions/auth";
import { OTP_TTL_SECONDS } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VerifyForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(verifyOtpAction, undefined);
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const [isResending, startResend] = useTransition();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = () => {
    startResend(async () => {
      const result = await resendOtpAction(email);
      if (result.ok) {
        setSecondsLeft(OTP_TTL_SECONDS);
        setCode("");
        toast.success("A new code has been sent.");
      } else {
        toast.error(result.error ?? "Could not resend the code.");
      }
    });
  };

  const expired = secondsLeft <= 0;

  return (
    <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center shadow-xl shadow-primary/5">
      <div className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="size-7 text-primary" />
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          1
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Enter verification code</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We&apos;ve sent a 6-digit code to
        <br />
        <span className="font-medium text-primary">{email}</span>
      </p>

      <form action={action} className="mt-6 flex flex-col items-center gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="code" value={code} />
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot key={i} index={i} className="size-11 rounded-xl border text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {expired ? (
            <span>Code expired</span>
          ) : (
            <span>
              Code expires in <span className="font-medium text-primary">{formatTime(secondsLeft)}</span>
            </span>
          )}
          <span className="text-border">|</span>
          <span>
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? "Resending…" : "Resend"}
            </button>
          </span>
        </div>

        <Button type="submit" disabled={pending || code.length < 6} size="lg" className="w-full">
          {pending ? "Verifying…" : "Verify code"}
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 border-t pt-4 text-xs text-muted-foreground">
        <Lock className="size-3.5 text-primary" />
        Secure and private. We never share your email.
      </div>
    </div>
  );
}
