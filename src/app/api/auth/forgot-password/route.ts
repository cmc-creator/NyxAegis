import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export const maxDuration = 30;

const RATE_LIMIT_MS = 60_000; // 1 request per email per minute

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Always return a generic success — never reveal whether the email exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Rate-limit: don't allow a new token if a non-expired, non-used one was created recently (within 1 min)
    const recent = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
        createdAt: { gt: new Date(Date.now() - RATE_LIMIT_MS) },
      },
    });

    if (!recent) {
      // Invalidate any previous unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }, // mark as used so they can't be replayed
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await sendPasswordResetEmail({ to: user.email, name: user.name ?? "", resetUrl });    }
  }

  // Generic response — never reveal whether the email is registered
  return NextResponse.json({ ok: true });
}
