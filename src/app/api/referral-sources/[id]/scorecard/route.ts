import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

/** Compute a 0-100 warmth score for a referral source.
 *  Higher = warmer (active relationship, recent interactions, growing referrals).
 */
function computeWarmthScore(params: {
  daysSinceLastActivity: number | null;
  activitiesLast30: number;
  referralsLast30: number;
  referralsTrend: number; // positive = growing
}): number {
  const { daysSinceLastActivity, activitiesLast30, referralsLast30, referralsTrend } = params;
  let score = 0;

  // Recency of last touch (max 40pts)
  if (daysSinceLastActivity === null) {
    score += 0; // never touched
  } else if (daysSinceLastActivity <= 7)  score += 40;
  else if (daysSinceLastActivity <= 14)   score += 30;
  else if (daysSinceLastActivity <= 30)   score += 18;
  else if (daysSinceLastActivity <= 60)   score += 6;
  else                                    score += 0;

  // Activity frequency last 30 days (max 30pts)
  if (activitiesLast30 >= 4)      score += 30;
  else if (activitiesLast30 >= 2) score += 20;
  else if (activitiesLast30 >= 1) score += 10;

  // Referral volume last 30 days (max 20pts)
  if (referralsLast30 >= 4)       score += 20;
  else if (referralsLast30 >= 2)  score += 14;
  else if (referralsLast30 >= 1)  score += 8;

  // Trend bonus (max 10pts)
  if (referralsTrend > 0)         score += 10;
  else if (referralsTrend === 0 && referralsLast30 > 0) score += 4;

  return Math.min(100, Math.max(0, score));
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sourceId = params.id;

  const source = await prisma.referralSource.findUnique({
    where: { id: sourceId },
    include: {
      assignedRep: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { referrals: true } },
    },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now   = new Date();
  const d30   = new Date(now); d30.setDate(d30.getDate() - 30);
  const d60   = new Date(now); d60.setDate(d60.getDate() - 60);
  const d6mo  = new Date(now); d6mo.setMonth(d6mo.getMonth() - 6);

  // Latest activity
  const [lastActivity, activitiesLast30Raw, referralsLast30, referralsPrev30, referralsMonthly, activitiesAll] = await Promise.all([
    prisma.activity.findFirst({
      where: { referralSourceId: sourceId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, type: true, title: true },
    }),
    prisma.activity.count({ where: { referralSourceId: sourceId, createdAt: { gte: d30 } } }),
    prisma.referral.count({ where: { referralSourceId: sourceId, createdAt: { gte: d30 } } }),
    prisma.referral.count({ where: { referralSourceId: sourceId, createdAt: { gte: d60, lt: d30 } } }),
    // Group referrals by month (last 6 months) — we'll bucket manually
    prisma.referral.findMany({
      where: { referralSourceId: sourceId, createdAt: { gte: d6mo } },
      select: { createdAt: true, status: true, serviceLine: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.activity.findMany({
      where: { referralSourceId: sourceId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, type: true, title: true, notes: true, createdAt: true, rep: { include: { user: { select: { name: true } } } } },
    }),
  ]);

  const daysSinceLast = lastActivity
    ? Math.floor((now.getTime() - new Date(lastActivity.createdAt).getTime()) / 86_400_000)
    : null;

  const trend = referralsLast30 - referralsPrev30;

  const warmthScore = computeWarmthScore({
    daysSinceLastActivity: daysSinceLast,
    activitiesLast30: activitiesLast30Raw,
    referralsLast30,
    referralsTrend: trend,
  });

  // Build monthly buckets
  const monthBuckets: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthBuckets[key] = 0;
  }
  for (const r of referralsMonthly) {
    const key = new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (key in monthBuckets) monthBuckets[key]++;
  }

  const monthlyData = Object.entries(monthBuckets).map(([month, count]) => ({ month, count }));

  return NextResponse.json({
    source,
    scorecard: {
      warmthScore,
      warmthLabel: warmthScore >= 70 ? "Warm" : warmthScore >= 40 ? "Cooling" : "Cold",
      daysSinceLastActivity: daysSinceLast,
      activitiesLast30: activitiesLast30Raw,
      referralsLast30,
      referralsPrev30,
      trend,
      totalReferrals: source._count.referrals,
      monthlyData,
      lastActivity,
      recentActivities: activitiesAll,
    },
  });
}
