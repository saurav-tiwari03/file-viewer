import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export type SessionPayload = { userId: string; email: string };

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + MAX_AGE_MS) / 1000))
    .sign(secret);
}

export async function decryptSession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, email: string) {
  const token = await encrypt({ userId, email });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_MS / 1000,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return decryptSession(token);
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}
