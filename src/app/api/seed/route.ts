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
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@destinysprings.com";
    const adminPw = await bcrypt.hash("admin123!", 10);

    await prisma.user.upsert({ where: { email: adminEmail }, update: {}, create: { email: adminEmail, name: "Destiny Springs Admin", password: adminPw, role: "ADMIN" } });

    const _repUser = await prisma.user.upsert({
      where: { email: "rep@nyxaegis.com" }, update: {},
      create: {
        email: "rep@nyxaegis.com", name: "Jordan Rivera", password: repPw, role: "REP",
        rep: { create: { phone: "615-555-2345", city: "Nashville", state: "TN", title: "Senior Account Executive", territory: "Southeast US", status: "ACTIVE", rating: 4.8, hipaaTrainedAt: new Date("2024-01-15"), licensedStates: ["TN","KY","AL","GA","FL"], businessName: "Rivera BD Consulting", w9OnFile: true, territories: { create: [{ state: "TN", city: "Nashville", region: "Middle Tennessee" }, { state: "KY", region: "Kentucky" }] } } },
      },
    });

    const _rep2User = await prisma.user.upsert({
      where: { email: "marcus@nyxaegis.com" }, update: {},
      create: {
        email: "marcus@nyxaegis.com", name: "Marcus Williams", password: repPw, role: "REP",
        rep: { create: { phone: "404-555-8821", city: "Atlanta", state: "GA", title: "Account Executive", territory: "Southeast - Georgia", status: "ACTIVE", rating: 4.5, hipaaTrainedAt: new Date("2024-03-20"), licensedStates: ["GA","FL","SC","NC"], businessName: "Williams Healthcare BD", w9OnFile: true, territories: { create: [{ state: "GA", city: "Atlanta", region: "Metro Atlanta" }] } } },
      },
    });

    const _rep3User = await prisma.user.upsert({
      where: { email: "priya@nyxaegis.com" }, update: {},
      create: {
        email: "priya@nyxaegis.com", name: "Priya Patel", password: repPw, role: "REP",
        rep: { create: { phone: "214-555-3344", city: "Dallas", state: "TX", title: "Regional Director", territory: "Texas", status: "ACTIVE", rating: 4.9, hipaaTrainedAt: new Date("2023-11-01"), licensedStates: ["TX","OK","LA","AR"], businessName: "Patel Health Solutions", w9OnFile: true, territories: { create: [{ state: "TX", city: "Dallas", region: "DFW" }, { state: "TX", city: "Houston", region: "Houston Metro" }] } } },
      },
    });

    await prisma.user.upsert({
      where: { email: "contact@nashvillegeneral.com" }, update: {},
      create: {
        email: "contact@nashvillegeneral.com", name: "Dr. Sarah Chen", password: accPw, role: "ACCOUNT",
        hospital: { create: { hospitalName: "Nashville General Medical Center", systemName: "Tennessee Health Alliance", hospitalType: "ACUTE_CARE", npi: "1234567890", bedCount: 450, annualRevenue: 280000000, serviceLines: ["Cardiology","Oncology","Orthopedics","Emergency Medicine"], primaryContactName: "Dr. Sarah Chen", primaryContactTitle: "Chief Medical Officer", primaryContactEmail: "contact@nashvillegeneral.com", primaryContactPhone: "615-555-1000", address: "1234 Medical Center Dr", city: "Nashville", state: "TN", zip: "37203", status: "ACTIVE", source: "REFERRAL", contractValue: 450000 } },
      },
    });

    return NextResponse.json({ ok: true, message: "Admin account seeded." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

