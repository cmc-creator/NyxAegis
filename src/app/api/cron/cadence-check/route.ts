import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

function safeCompare(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  const bufA = Buffer.alloc(len);
  const bufB = Buffer.alloc(len);
  Buffer.from(a).copy(bufA);
  Buffer.from(b).copy(bufB);
  return timingSafeEqual(bufA, bufB) && a.length === b.length;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!safeCompare(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // ── 1. Load all active sources that have an assigned rep ──────────────────
  const sources = await prisma.referralSource.findMany({
    where: { active: true, assignedRepId: { not: null } },
    select: {
      id: true,
      name: true,
      assignedRepId: true,
      visitFrequencyDays: true,
    },
  });

  if (sources.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, notified: 0 });
  }

  const sourceIds = sources.map((s) => s.id);

  // ── 2. Last activity per source ───────────────────────────────────────────
  const lastActivities = await prisma.activity.findMany({
    where: { referralSourceId: { in: sourceIds } },
    orderBy: { createdAt: "desc" },
    select: { referralSourceId: true, createdAt: true },
  });

  const lastActivityMap: Record<string, Date> = {};
  for (const a of lastActivities) {
    if (a.referralSourceId && !lastActivityMap[a.referralSourceId]) {
      lastActivityMap[a.referralSourceId] = new Date(a.createdAt);
    }
  }

  // ── 3. Rep userId map ─────────────────────────────────────────────────────
  const repIds = [...new Set(sources.map((s) => s.assignedRepId).filter(Boolean) as string[])];
  const reps = await prisma.rep.findMany({
    where: { id: { in: repIds } },
    select: { id: true, userId: true, user: { select: { name: true } } },
  });
  const repUserMap: Record<string, string> = {};
  for (const r of reps) repUserMap[r.id] = r.userId;

  // ── 4. Already-notified sources today (deduplicate) ───────────────────────
  const todayNotifications = await prisma.notification.findMany({
    where: {
      createdAt: { gte: todayStart },
      type: "CADENCE_ALERT",
    },
    select: { link: true },
  });
  const alreadyNotifiedLinks = new Set(todayNotifications.map((n) => n.link ?? ""));

  // ── 5. Find overdue sources and build notifications ───────────────────────
  const toCreate: {
    userId: string;
    title: string;
    body: string;
    type: string;
    link: string;
  }[] = [];

  for (const source of sources) {
    if (!source.assignedRepId) continue;
    const userId = repUserMap[source.assignedRepId];
    if (!userId) continue;

    const lastDate = lastActivityMap[source.id] ?? null;
    const daysSince = lastDate
      ? Math.floor((now.getTime() - lastDate.getTime()) / 86_400_000)
      : null;

    // Use visitFrequencyDays from DB, default 14
    const freqDays =
      (source as { visitFrequencyDays?: number | null }).visitFrequencyDays ?? 14;

    const isOverdue = daysSince === null || daysSince >= freqDays;
    if (!isOverdue) continue;

    const link = `/rep/today?source=${source.id}`;
    if (alreadyNotifiedLinks.has(link)) continue; // already notified today

    const daysMsg =
      daysSince === null
        ? "has never been visited"
        : `hasn't been visited in ${daysSince} days (every ${freqDays}d cadence)`;

    toCreate.push({
      userId,
      title: `Visit overdue: ${source.name}`,
      body: `${source.name} ${daysMsg}. Time to reach out!`,
      type: "CADENCE_ALERT",
      link,
    });
  }

  // ── 6. Batch create notifications ─────────────────────────────────────────
  let notified = 0;
  if (toCreate.length > 0) {
    const result = await prisma.notification.createMany({ data: toCreate });
    notified = result.count;
  }

  return NextResponse.json({
    ok: true,
    checked: sources.length,
    overdue: toCreate.length,
    notified,
    timestamp: now.toISOString(),
  });
}
