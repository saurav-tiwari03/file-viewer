import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/session";

const PROTECTED_PREFIXES = ["/files", "/recent", "/favorites", "/trash", "/folders", "/account"];
const AUTH_ROUTES = ["/login", "/verify"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => path.startsWith(p));

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await decryptSession(req.cookies.get("session")?.value);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/files", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|pdf.worker.min.mjs|.*\\.(?:svg|png|jpg)$).*)"],
};
