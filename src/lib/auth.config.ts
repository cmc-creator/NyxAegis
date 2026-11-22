import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

function getRoleHome(role?: string) {
  switch (role) {
    case "ADMIN":   return "/admin/dashboard";
    case "REP":     return "/rep/dashboard";
    case "ACCOUNT": return "/account/dashboard";
    default:        return "/login";
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role as never;
        token.verified = (user as { verified?: boolean }).verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
        session.user.verified = token.verified as boolean | undefined;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const verified = (auth?.user as { verified?: boolean } | undefined)?.verified;
      const { pathname } = nextUrl;

      // Self-serve ACCOUNT/REP accounts that have not verified their email
      // land on the verify notice instead of the portals, and their API
      // access is refused. Sessions minted before this gate existed have
      // no verified flag; the portal layouts re-check against the database
      // for those, so only an explicit false is gated here.
      const isUnverifiedPortalUser =
        isLoggedIn && (role === "ACCOUNT" || role === "REP") && verified === false;

      const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/rep") ||
        pathname.startsWith("/account");

      if (isProtected && !isLoggedIn) return false; // → redirect to /login

      if (isUnverifiedPortalUser) {
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/rep") ||
          pathname.startsWith("/account")
        ) {
          return NextResponse.redirect(new URL("/verify-email", nextUrl));
        }
        if (
          pathname.startsWith("/api/") &&
          !pathname.startsWith("/api/verify-email") &&
          !pathname.startsWith("/api/resend-verification")
        ) {
          return NextResponse.json(
            { error: "Email verification required" },
            { status: 403 }
          );
        }
      }

      // Redirect logged-in users away from login page
      if (isLoggedIn && pathname === "/login") {
        if (isUnverifiedPortalUser) {
          return NextResponse.redirect(new URL("/verify-email", nextUrl));
        }
        return NextResponse.redirect(new URL(getRoleHome(role), nextUrl));
      }

      // Role-based access control
      if (isLoggedIn) {
        if (pathname.startsWith("/admin") && role !== "ADMIN") {
          return NextResponse.redirect(new URL(getRoleHome(role), nextUrl));
        }
        if (pathname.startsWith("/rep") && role !== "REP" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/unauthorized", nextUrl));
        }
        if (pathname.startsWith("/account") && role !== "ACCOUNT" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      return true;
    },
  },
  session: { strategy: "jwt", maxAge: 28800, updateAge: 3600 },
  providers: [],
};
