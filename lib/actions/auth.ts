"use server";

import { redirect } from "next/navigation";
import { RequestOtpSchema, VerifyOtpSchema } from "@/lib/definitions";
import { requestOtp, verifyOtp } from "@/lib/otp";
import { deleteSession } from "@/lib/session";

export type ActionState = { error?: string } | undefined;

export async function requestOtpAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = RequestOtpSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter a valid email." };
  }

  const result = await requestOtp(parsed.data.email);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function verifyOtpAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = VerifyOtpSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter the 6-digit code." };
  }

  const result = await verifyOtp(parsed.data.email, parsed.data.code);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/files");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function resendOtpAction(email: string): Promise<{ ok: boolean; error?: string }> {
  const parsed = RequestOtpSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: "Invalid email." };
  }

  const result = await requestOtp(parsed.data.email);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}
