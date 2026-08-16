import "server-only";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import { createSession } from "@/lib/session";
import { OTP_TTL_SECONDS } from "@/lib/definitions";

const OTP_TTL_MS = OTP_TTL_SECONDS * 1000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

function hashOtp(code: string, email: string) {
  const pepper = process.env.OTP_PEPPER ?? process.env.SESSION_SECRET;
  return createHash("sha256").update(`${code}:${email}:${pepper}`).digest("hex");
}

export type RequestOtpResult = { ok: true } | { ok: false; error: string };

export async function requestOtp(email: string): Promise<RequestOtpResult> {
  const recentCount = await prisma.otpCode.count({
    where: { email, createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
  });
  if (recentCount >= RATE_LIMIT_MAX_REQUESTS) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.otpCode.create({
    data: {
      email,
      codeHash: hashOtp(code, email),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    console.error("Failed to send OTP email, logging code for local development:", err);
    console.log(`[dev fallback] OTP for ${email}: ${code}`);
  }

  return { ok: true };
}

export type VerifyOtpResult = { ok: true } | { ok: false; error: string };

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const otp = await prisma.otpCode.findFirst({
    where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { ok: false, error: "That code has expired. Please request a new one." };
  }

  if (otp.attempts >= otp.maxAttempts) {
    return { ok: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  if (otp.codeHash !== hashOtp(code, email)) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: "Incorrect code. Please try again." };
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  await createSession(user.id, user.email);

  return { ok: true };
}
