import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEmailVerified } from "@/lib/verification";
import { ResendButton, SignOutButton } from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

function getRoleHome(role?: string) {
  switch (role) {
    case "ADMIN":   return "/admin/dashboard";
    case "REP":     return "/rep/dashboard";
    case "ACCOUNT": return "/account/dashboard";
    default:        return "/login";
  }
}

const GOLD_LINK: React.CSSProperties = {
  display: "inline-block",
  background: "#c9a84c",
  color: "#1a1208",
  padding: "10px 22px",
  borderRadius: 7,
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.3px",
  textDecoration: "none",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let session: any = null;
  try { session = await auth(); } catch { session = null; }

  let verified = false;
  let email = session?.user?.email ?? "";
  if (session?.user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (dbUser) {
        verified = isEmailVerified(dbUser);
        email = dbUser.email;
      }
    } catch { /* fall through with session defaults */ }
  }

  // A signed-in session minted before verification can carry a stale
  // "unverified" flag until the next sign-in; the database check above is
  // the source of truth for what this page shows.
  const sessionStale = verified && session?.user?.verified === false;

  let title = "Verify your email";
  let body: React.ReactNode = null;

  if (verified) {
    title = "Email verified";
    body = (
      <>
        <p style={{ color: "rgba(237,228,207,0.6)", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
          Your email address is verified and your portal is open.
          {sessionStale
            ? " If you still see the verify notice, sign out and sign back in once so your session refreshes."
            : ""}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {session ? (
            <>
              <Link href={getRoleHome(session.user.role)} style={GOLD_LINK}>Continue to your portal</Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" style={GOLD_LINK}>Sign in</Link>
          )}
        </div>
      </>
    );
  } else if (!session) {
    body = (
      <>
        <p style={{ color: "rgba(237,228,207,0.6)", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
          {status === "invalid"
            ? "That verification link is invalid or has expired. Sign in to send yourself a fresh one."
            : "We email a verification link to every new account. Sign in to check your status or resend the link."}
        </p>
        <Link href="/login" style={GOLD_LINK}>Sign in</Link>
      </>
    );
  } else {
    body = (
      <>
        <p style={{ color: "rgba(237,228,207,0.6)", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
          {status === "invalid"
            ? "That verification link is invalid or has expired. "
            : ""}
          We sent a verification link to <strong style={{ color: "#ede4cf" }}>{email}</strong>.
          Click it to verify your email and open your portal. The link expires in 24 hours.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "flex-start" }}>
          <ResendButton />
          <SignOutButton />
        </div>
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0806",
        padding: 20,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "#0f0d0a",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 12,
          padding: "32px 36px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 4 }}>
          NYXAEGIS
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#ede4cf", margin: "0 0 14px" }}>{title}</h1>
        {body}
      </div>
    </div>
  );
}
