export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function computeWarmth(daysSince: number | null, acts30: number, refs30: number): number {
  let s = 0;
  if (daysSince === null)       s += 0;
  else if (daysSince <= 7)      s += 40;
  else if (daysSince <= 14)     s += 30;
  else if (daysSince <= 30)     s += 18;
  else if (daysSince <= 60)     s += 6;
  if (acts30 >= 4)              s += 30;
  else if (acts30 >= 2)         s += 20;
  else if (acts30 >= 1)         s += 10;
  if (refs30 >= 4)              s += 20;
  else if (refs30 >= 2)         s += 14;
  else if (refs30 >= 1)         s += 8;
  return Math.min(100, s);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const repId   = searchParams.get("repId") ?? undefined;
  const active  = searchParams.get("active");
  const type    = searchParams.get("type") ?? undefined;
  const search  = searchParams.get("q") ?? undefined;
  const includeWarmth = searchParams.get("warmth") === "1";

  const sources = await prisma.referralSource.findMany({
    where: {
      ...(repId  ? { assignedRepId: repId } : {}),
      ...(active !== null ? { active: active !== "false" } : {}),
      ...(type   ? { type: type as never } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    include: {
      assignedRep: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { referrals: true } },
    },
    orderBy: { name: "asc" },
  });

  if (!includeWarmth) return NextResponse.json(sources);

  // Batch-compute warmth scores
  const now = new Date();
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
  const ids  = sources.map(s => s.id);

  const [lastActivities, acts30, refs30] = await Promise.all([
    prisma.activity.findMany({
      where: { referralSourceId: { in: ids } },
      orderBy: { createdAt: "desc" },
      select: { referralSourceId: true, createdAt: true },
    }),
    prisma.activity.groupBy({
      by: ["referralSourceId"],
      where: { referralSourceId: { in: ids }, createdAt: { gte: d30 } },
      _count: true,
    }),
    prisma.referral.groupBy({
      by: ["referralSourceId"],
      where: { referralSourceId: { in: ids }, createdAt: { gte: d30 } },
      _count: true,
    }),
  ]);

  const lastMap: Record<string, Date> = {};
  for (const a of lastActivities) {
    if (a.referralSourceId && !lastMap[a.referralSourceId]) {
      lastMap[a.referralSourceId] = new Date(a.createdAt);
    }
  }
  const acts30Map: Record<string, number> = {};
  for (const a of acts30) { if (a.referralSourceId) acts30Map[a.referralSourceId] = a._count; }
  const refs30Map: Record<string, number> = {};
  for (const r of refs30) { if (r.referralSourceId) refs30Map[r.referralSourceId] = r._count; }

  const withWarmth = sources.map(s => {
    const lastDate  = lastMap[s.id] ?? null;
    const daysSince = lastDate ? Math.floor((now.getTime() - lastDate.getTime()) / 86_400_000) : null;
    const warmth    = computeWarmth(daysSince, acts30Map[s.id] ?? 0, refs30Map[s.id] ?? 0);
    const warmthLabel = warmth >= 70 ? "Warm" : warmth >= 40 ? "Cooling" : "Cold";
    return { ...s, warmthScore: warmth, warmthLabel, daysSinceLastActivity: daysSince };
  });

  return NextResponse.json(withWarmth);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, type, specialty, practiceName, npi,
    contactName, email, phone,
    address, city, state, zip,
    assignedRepId, monthlyGoal, notes,
  } = body;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const source = await prisma.referralSource.create({
    data: {
      name,
      type: type ?? "PHYSICIAN",
      specialty,
      practiceName,
      npi,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      assignedRepId: assignedRepId || null,
      monthlyGoal: monthlyGoal ? Number(monthlyGoal) : null,
      notes,
    },
  });

  return NextResponse.json(source, { status: 201 });
}
