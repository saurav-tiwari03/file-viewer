"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RequestOtpSchema, VerifyOtpSchema, UpdateNameSchema } from "@/lib/definitions";
import { requestOtp, verifyOtp } from "@/lib/otp";
import { deleteSession } from "@/lib/session";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

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

export type UpdateNameState = { error?: string; success?: boolean } | undefined;

export async function updateNameAction(_prevState: UpdateNameState, formData: FormData): Promise<UpdateNameState> {
  const parsed = UpdateNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter your name." };
  }

  const session = await verifySession();
  await prisma.user.update({ where: { id: session.userId }, data: { name: parsed.data.name } });
  revalidatePath("/settings");
  return { success: true };
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
