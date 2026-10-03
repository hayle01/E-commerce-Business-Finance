import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isApiAuth = pathname.startsWith("/api/auth");
  const isPublicAsset =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".");

  if (isApiAuth || isPublicAsset) {
    return NextResponse.next();
  }

  const authed = hasSessionCookie(request);

  if (!authed && !isAuthPage) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (authed && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
