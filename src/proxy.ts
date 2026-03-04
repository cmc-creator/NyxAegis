import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Use NextAuth's Edge-compatible auth() so it correctly decrypts JWE session
// tokens instead of trying to verify them as plain JWS with jose jwtVerify.
const { auth } = NextAuth(authConfig);

function getRoleHome(role?: string) {
  switch (role) {
    case "ADMIN":   return "/admin/dashboard";
    case "REP":     return "/rep/dashboard";
    case "ACCOUNT": return "/account/dashboard";
    default:        return "/login";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const proxy = auth(function middleware(req: any) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/pricing" ||
    pathname === "/signup" ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/api/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  const role = req.auth?.user?.role as string | undefined;

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(getRoleHome(role), req.url));
  }
  if (pathname.startsWith("/rep") && role !== "REP" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/account") && role !== "ACCOUNT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;
