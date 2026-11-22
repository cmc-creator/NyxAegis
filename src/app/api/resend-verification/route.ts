import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { isEmailVerified, sendVerificationForUser } from "@/lib/verification";

export const maxDuration = 30;

// POST /api/resend-verification - resend the verification email to the
// signed-in user. Used by the Resend button on the verify notice page.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isEmailVerified(user)) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const limit = await checkRateLimit({
    namespace: "verify-resend",
    key: user.id,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many resend attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  await sendVerificationForUser(user);
  return NextResponse.json({ ok: true });
}
