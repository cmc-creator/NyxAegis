import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import AIInsightsPanel from "@/components/ai/AIInsightsPanel";
import Link from "next/link";

const CYAN = "var(--nyx-accent)";
const CARD = "var(--nyx-card)";
const BORDER = "var(--nyx-accent-dim)";
const TEXT = "var(--nyx-text)";
const TEXT_MUTED = "var(--nyx-text-muted)";

export const dynamic = "force-dynamic";

export default async function RepDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const rep = await prisma.rep.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true } },
      opportunities: {
        include: { hospital: { select: { hospitalName: true } } },
        orderBy: { updatedAt: "desc" },
        take: 6,
      },
      activities: { orderBy: { createdAt: "desc" }, take: 5 },
      territories: true,
      _count: { select: { opportunities: true, leads: true, territories: true } },
    },
  });

  if (!rep) redirect("/login");

  const now = new Date();

  // Referral source data
  const mySources = await prisma.referralSource.findMany({
    where: { assignedRepId: rep.id, active: true },
    select: { id: true, name: true, visitFrequencyDays: true, type: true },
  });

  const sourceIds = mySources.map((s) => s.id);
  const lastActivities = sourceIds.length > 0
    ? await prisma.activity.findMany({
        where: { referralSourceId: { in: sourceIds } },
        orderBy: { createdAt: "desc" },
        select: { referralSourceId: true, createdAt: true },
      })
    : [];
  const lastActivityMap: Record<string, Date> = {};
  for (const a of lastActivities) {
    if (a.referralSourceId && !lastActivityMap[a.referralSourceId])
      lastActivityMap[a.referralSourceId] = new Date(a.createdAt);
  }

  // Referrals received last 30d
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
  const recentReferrals = sourceIds.length > 0
    ? await prisma.referral.count({
        where: { referralSourceId: { in: sourceIds }, createdAt: { gte: d30 } },
      })
    : 0;

  const overdueCount = mySources.filter((s) => {
    const last = lastActivityMap[s.id] ?? null;
    const days = last ? Math.floor((now.getTime() - last.getTime()) / 86_400_000) : null;
    const freq = (s as { visitFrequencyDays?: number | null }).visitFrequencyDays ?? 14;
    return days === null || days >= freq;
  }).length;

  // Today actions
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const todayActivityCount = await prisma.activity.count({
    where: { repId: rep.id, scheduledAt: { gte: todayStart, lte: todayEnd } },
  });

  const openOpps = rep.opportunities.filter(o => !["CLOSED_WON", "CLOSED_LOST"].includes(o.stage));
  const closedWon = rep.opportunities.filter(o => o.stage === "CLOSED_WON");
  const pipelineValue = openOpps.reduce((s, o) => s + (o.value ? Number(o.value) : 0), 0);

  const totalTodayItems = todayActivityCount + overdueCount;

  return (
    <div>
      {/* Today Banner */}
      <Link href="/rep/today" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
        <div style={{
          background: "linear-gradient(135deg, var(--nyx-accent-dim), rgba(0,0,0,0))",
          border: "1px solid var(--nyx-accent-str)", borderRadius: 12,
          padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--nyx-accent-label)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>
              DAILY PLANNER
            </p>
            <p style={{ fontWeight: 700, color: TEXT, fontSize: "0.95rem" }}>
              {totalTodayItems === 0
                ? "You're all caught up today ✅"
                : `${totalTodayItems} item${totalTodayItems !== 1 ? "s" : ""} need attention today`}
            </p>
            <p style={{ fontSize: "0.72rem", color: TEXT_MUTED, marginTop: 2 }}>
              {todayActivityCount > 0 && `${todayActivityCount} scheduled `}
              {overdueCount > 0 && `· ${overdueCount} source${overdueCount !== 1 ? "s" : ""} overdue for a visit`}
            </p>
          </div>
          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>📋→</span>
        </div>
      </Link>

      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "var(--nyx-accent-label)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>REP PORTAL</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Welcome, {rep.user.name?.split(" ")[0]}</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>{rep.title} · {rep.territory ?? "No territory set"}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Open Opportunities", value: openOpps.length, color: CYAN, icon: "📊" },
          { label: "Closed Won", value: closedWon.length, color: "#34d399", icon: "✅" },
          { label: "Pipeline Value", value: formatCurrency(pipelineValue), color: CYAN, icon: "💰" },
          { label: "My Sources", value: mySources.length, color: "#a78bfa", icon: "🤝" },
          { label: "Referrals (30d)", value: recentReferrals, color: "#fbbf24", icon: "📥" },
          { label: "Sources Overdue", value: overdueCount, color: overdueCount > 0 ? "#f87171" : "#34d399", icon: overdueCount > 0 ? "⚠️" : "🎯" },
        ].map((s) => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 18px" }}>
            <div style={{ fontSize: "1.3rem", marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, textShadow: "0 0 20px var(--nyx-accent-str)", lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div style={{ marginBottom: 28 }}>
        <AIInsightsPanel role="rep" />
      </div>

      <div className="nyx-page-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--nyx-accent-label)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>MY OPPORTUNITIES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openOpps.length === 0 && <p style={{ color: TEXT_MUTED, fontSize: "0.85rem" }}>No open opportunities.</p>}
            {openOpps.map((opp) => (
              <div key={opp.id} style={{ padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", color: TEXT, marginBottom: 2 }}>{opp.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{opp.hospital.hospitalName}</span>
                  {opp.value && <span style={{ fontSize: "0.75rem", color: CYAN, fontWeight: 600 }}>{formatCurrency(Number(opp.value))}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--nyx-accent-label)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>RECENT ACTIVITY</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rep.activities.length === 0 && <p style={{ color: TEXT_MUTED, fontSize: "0.85rem" }}>No activity logged yet.</p>}
            {rep.activities.map((act) => (
              <div key={act.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: CYAN, marginTop: 6, flexShrink: 0, opacity: 0.6 }} />
                <div>
                  <div style={{ fontSize: "0.82rem", color: TEXT }}>{act.title}</div>
                  <div style={{ fontSize: "0.7rem", color: TEXT_MUTED }}>{act.type} · {formatRelativeTime(act.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
