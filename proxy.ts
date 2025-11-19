import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PATHS = new Set([
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
]);
const PUBLIC_ROOTS = new Set(["/"]);
const PROTECTED_PREFIXES = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname, search } = request.nextUrl;

  const isAuthPage = AUTH_PATHS.has(pathname);
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isPublicRoot = PUBLIC_ROOTS.has(pathname);

  if (sessionCookie && (isAuthPage || isPublicRoot)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!sessionCookie && isProtectedRoute) {
    const redirectURL = new URL("/auth/login", request.url);
    const returnTo = `${pathname}${search}`;
    redirectURL.searchParams.set("redirectTo", returnTo);
    return NextResponse.redirect(redirectURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/dashboard/:path*",
  ],
};
