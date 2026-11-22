import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

// Email verification gate for self-serve signups (ACCOUNT and REP roles).
// Accounts created before the gate launched are grandfathered: they count
// as verified so nobody current (seeded demo accounts included) is locked
// out. Admin-created accounts are stamped verified at creation time, and
// admins are always exempt.
export const VERIFICATION_REQUIRED_SINCE = new Date("2026-11-22T21:00:00.000Z");

export function isEmailVerified(user: {
  emailVerified: Date | null;
  createdAt: Date;
  role: string;
}): boolean {
  if (user.role === "ADMIN") return true;
  if (user.emailVerified) return true;
  return user.createdAt < VERIFICATION_REQUIRED_SINCE;
}

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Issues a fresh verification token (invalidating any unused ones) and
// emails the verify link to the user.
export async function sendVerificationForUser(user: {
  id: string;
  email: string;
  name: string | null;
}): Promise<void> {
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.nyxaegis.com";
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;
  await sendVerificationEmail({ to: user.email, name: user.name ?? "", verifyUrl });
}
