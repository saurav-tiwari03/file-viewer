import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "anon_session";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

type AnonPayload = { sessionId: string };

async function encrypt(payload: AnonPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + MAX_AGE_MS) / 1000))
    .sign(secret);
}

async function decrypt(token?: string): Promise<AnonPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload as unknown as AnonPayload;
  } catch {
    return null;
  }
}

/** Returns the current anonymous session id, if any, without creating one. */
export async function getAnonymousSessionId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const payload = await decrypt(token);
  return payload?.sessionId ?? null;
}

/** Returns the current anonymous session id, minting and setting a new cookie if absent. */
export async function ensureAnonymousSessionId(): Promise<string> {
  const existing = await getAnonymousSessionId();
  if (existing) return existing;

  const sessionId = randomUUID();
  const token = await encrypt({ sessionId });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_MS / 1000,
    path: "/",
  });
  return sessionId;
}
