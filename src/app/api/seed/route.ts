import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nyxaegis.com";
    const adminPw = await bcrypt.hash("admin123!", 10);

    await prisma.user.upsert({ where: { email: adminEmail }, update: {}, create: { email: adminEmail, name: "NyxAegis Admin", password: adminPw, role: "ADMIN" } });

    return NextResponse.json({ ok: true, message: "Admin account seeded." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

