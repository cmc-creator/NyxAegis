import { prisma } from "@/lib/prisma";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const typeColors: Record<string, string> = {
  MEETING: "#60a5fa", DEMO: "#fbbf24", SITE_VISIT: "#34d399", CALL: "#00d4ff",
  CONFERENCE: "#a78bfa", EMAIL: "#94a3b8", NOTE: "#94a3b8", TASK: "#f59e0b",
};

function formatEventDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatEventTime(d: Date | null) {
  if (!d) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function CalendarPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysOut  = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  // Upcoming scheduled activities
  const upcoming = await prisma.activity.findMany({
    where: {
      scheduledAt: { gte: thirtyDaysAgo, lte: sixtyDaysOut },
    },
    include: {
      hospital: { select: { hospitalName: true } },
      rep:      { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });

  // Overdue activities (scheduled but not completed and past due)
  const overdue = await prisma.activity.findMany({
    where: {
      scheduledAt:  { lt: now },
      completedAt:  null,
    },
    include: {
      hospital: { select: { hospitalName: true } },
      rep:      { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 10,
  });

  const upcomingOnly = upcoming.filter(a => a.scheduledAt && a.scheduledAt >= now && !a.completedAt);
  const recentPast   = upcoming.filter(a => a.scheduledAt && a.scheduledAt < now && a.completedAt);

  const todayCount    = upcomingOnly.filter(a => {
    const d = a.scheduledAt!;
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>COMMAND</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Calendar</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>Scheduled meetings, demos, and site visits</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Today",      value: todayCount,             color: CYAN },
          { label: "Upcoming",   value: upcomingOnly.length,    color: "#60a5fa" },
          { label: "Overdue",    value: overdue.length,         color: "#f87171" },
          { label: "Completed",  value: recentPast.length,      color: "#34d399" },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px", minWidth: 100 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "14px 20px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f87171", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>⚠ OVERDUE ACTIVITIES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overdue.slice(0, 4).map(act => (
              <div key={act.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.82rem", color: "#fca5a5" }}>{act.title}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(248,113,113,0.6)", whiteSpace: "nowrap" }}>{formatEventDate(act.scheduledAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,212,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>UPCOMING</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {upcomingOnly.length === 0 && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px", textAlign: "center", color: TEXT_MUTED, fontSize: "0.85rem" }}>
            No upcoming scheduled activities. Schedule activities from the Leads or Opportunities pages.
          </div>
        )}
        {upcomingOnly.map((act) => (
          <div key={act.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 4, height: 44, background: typeColors[act.type] ?? CYAN, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem", color: TEXT, marginBottom: 3 }}>{act.title}</div>
                <div style={{ fontSize: "0.73rem", color: TEXT_MUTED }}>
                  {act.hospital?.hospitalName ?? "No hospital"}{act.rep ? ` · 👤 ${act.rep.user.name}` : ""}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: TEXT }}>{formatEventDate(act.scheduledAt)}</div>
              {act.scheduledAt && <div style={{ fontSize: "0.73rem", color: TEXT_MUTED }}>{formatEventTime(act.scheduledAt)}</div>}
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: typeColors[act.type] ?? CYAN, marginTop: 4, letterSpacing: "0.08em" }}>{act.type.replace(/_/g, " ")}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently completed */}
      {recentPast.length > 0 && (
        <>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(52,211,153,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>RECENTLY COMPLETED</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentPast.slice(0, 6).map((act) => (
              <div key={act.id} style={{ background: "rgba(52,211,153,0.03)", border: `1px solid rgba(52,211,153,0.08)`, borderRadius: 10, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.75 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 4, height: 36, background: "#34d399", borderRadius: 2, flexShrink: 0, opacity: 0.5 }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.84rem", color: TEXT, marginBottom: 2 }}>{act.title}</div>
                    <div style={{ fontSize: "0.7rem", color: TEXT_MUTED }}>{act.hospital?.hospitalName ?? "No hospital"}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.72rem", color: "#34d399" }}>✓ {formatEventDate(act.completedAt)}</div>
                  <div style={{ fontSize: "0.62rem", color: TEXT_MUTED, marginTop: 2 }}>{act.type.replace(/_/g, " ")}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
