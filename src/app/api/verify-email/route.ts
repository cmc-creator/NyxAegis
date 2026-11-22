import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

// GET /api/verify-email?token=... - target of the verification email link.
// Stamps the user verified and lands them on the verify notice page.
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.nyxaegis.com";
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?status=invalid", baseUrl));
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL("/verify-email?status=invalid", baseUrl));
  }

  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/verify-email?status=verified", baseUrl));
}
