import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = {
  accent: "var(--nyx-accent)",
  text:   "var(--nyx-text)",
  muted:  "var(--nyx-text-muted)",
  card:   "var(--nyx-card)",
  border: "var(--nyx-border)",
  dim:    "var(--nyx-accent-dim)",
  label:  "var(--nyx-accent-label)",
};

const ACTIVITY_EMOJI: Record<string, string> = {
  CALL:"📞", MEETING:"🤝", LUNCH:"🍽️", SITE_VISIT:"📍", EMAIL:"✉️",
  FOLLOW_UP:"🔔", CONFERENCE:"🎤", DEMO_COMPLETED:"🖥️", TASK:"✅",
  NOTE:"📝", PROPOSAL_SENT:"📄", CONTRACT_SENT:"📋",
};

function WarmthDot({ score }: { score: number }) {
  const color = score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";
  const label = score >= 70 ? "Warm"    : score >= 40 ? "Cooling" : "Cold";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontSize: "0.7rem", color, fontWeight: 700 }}>{label}</span>
    </span>
  );
}

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

export default async function RepTodayPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rep = await prisma.rep.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!rep) redirect("/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const now = new Date();
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);

  // Fetch everything in parallel
  const [
    todayActivities,
    overdueOpps,
    overdueLeads,
    mySources,
  ] = await Promise.all([
    // Activities scheduled for today
    prisma.activity.findMany({
      where: {
        repId: rep.id,
        scheduledAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        hospital: { select: { hospitalName: true } },
        referralSource: { select: { name: true } },
      },
    }),
    // Opportunities with overdue follow-up
    prisma.opportunity.findMany({
      where: {
        assignedRepId: rep.id,
        stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] },
        nextFollowUp: { lte: todayEnd },
      },
      orderBy: { nextFollowUp: "asc" },
      include: { hospital: { select: { hospitalName: true } } },
      take: 10,
    }),
    // Leads with overdue follow-up
    prisma.lead.findMany({
      where: {
        assignedRepId: rep.id,
        status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
        nextFollowUp: { lte: todayEnd },
      },
      orderBy: { nextFollowUp: "asc" },
      take: 10,
    }),
    // All active sources assigned to this rep
    prisma.referralSource.findMany({
      where: { assignedRepId: rep.id, active: true },
      include: {
        _count: { select: { referrals: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Compute last-activity date per source
  const sourceIds = mySources.map(s => s.id);
  const [lastActivitiesRaw, recentReferrals] = await Promise.all([
    prisma.activity.findMany({
      where: { referralSourceId: { in: sourceIds } },
      orderBy: { createdAt: "desc" },
      select: { referralSourceId: true, createdAt: true },
    }),
    prisma.referral.findMany({
      where: { referralSourceId: { in: sourceIds }, createdAt: { gte: d30 } },
      select: { referralSourceId: true },
    }),
  ]);

  // Build maps
  const lastActivityMap: Record<string, Date> = {};
  for (const a of lastActivitiesRaw) {
    if (a.referralSourceId && !lastActivityMap[a.referralSourceId]) {
      lastActivityMap[a.referralSourceId] = new Date(a.createdAt);
    }
  }
  const refs30Map: Record<string, number> = {};
  for (const r of recentReferrals) {
    refs30Map[r.referralSourceId] = (refs30Map[r.referralSourceId] ?? 0) + 1;
  }

  // Find sources overdue for a visit
  const overdueSourcesWithScore = mySources
    .map((s) => {
      const lastDate = lastActivityMap[s.id] ?? null;
      const daysSince = lastDate ? Math.floor((now.getTime() - lastDate.getTime()) / 86_400_000) : null;
      const freqDays  = (s as { visitFrequencyDays?: number | null }).visitFrequencyDays ?? 14;
      const overdue   = daysSince === null || daysSince >= freqDays;
      const refs30    = refs30Map[s.id] ?? 0;
      const warmth    = computeWarmth(daysSince, 0, refs30);
      return { ...s, daysSince, overdue, warmth, freqDays };
    })
    .filter((s) => s.overdue)
    .sort((a, b) => (b.daysSince ?? 9999) - (a.daysSince ?? 9999));

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const totalActions = todayActivities.length + overdueOpps.length + overdueLeads.length + overdueSourcesWithScore.length;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: C.label, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: C.text, lineHeight: 1.15 }}>
          {greeting()}, {rep.user.name?.split(" ")[0]}
        </h1>
        <p style={{ color: C.muted, fontSize: "0.85rem", marginTop: 6 }}>
          {totalActions === 0
            ? "You're all caught up. Great work today! ✅"
            : `${totalActions} item${totalActions !== 1 ? "s" : ""} need your attention today.`}
        </p>
      </div>

      {/* Today's Scheduled Activities */}
      {todayActivities.length > 0 && (
        <Section label="Scheduled Today" count={todayActivities.length} color="#60a5fa">
          {todayActivities.map((a) => (
            <ActivityCard key={a.id} title={a.title} type={a.type}
              subtitle={a.hospital?.hospitalName ?? a.referralSource?.name ?? ""}
              time={a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : undefined}
            />
          ))}
        </Section>
      )}

      {/* Sources Due for a Visit */}
      {overdueSourcesWithScore.length > 0 && (
        <Section label="Sources Due for a Visit" count={overdueSourcesWithScore.length} color="#fbbf24">
          {overdueSourcesWithScore.slice(0, 8).map((s) => (
            <SourceVisitCard
              key={s.id}
              id={s.id}
              name={s.name}
              type={s.type}
              specialty={s.specialty ?? undefined}
              phone={s.phone ?? undefined}
              city={s.city ?? undefined}
              state={s.state ?? undefined}
              daysSince={s.daysSince}
              warmth={s.warmth}
              freqDays={s.freqDays}
            />
          ))}
          {overdueSourcesWithScore.length > 8 && (
            <p style={{ fontSize: "0.76rem", color: C.muted, textAlign: "center", paddingTop: 4 }}>
              +{overdueSourcesWithScore.length - 8} more · <Link href="/rep/territory" style={{ color: C.accent }}>View all</Link>
            </p>
          )}
        </Section>
      )}

      {/* Overdue Opportunity Follow-ups */}
      {overdueOpps.length > 0 && (
        <Section label="Opportunity Follow-ups Due" count={overdueOpps.length} color="#f87171">
          {overdueOpps.map((o) => (
            <FollowUpCard
              key={o.id}
              title={o.title}
              subtitle={o.hospital.hospitalName}
              badge={o.stage}
              dueDate={o.nextFollowUp ? new Date(o.nextFollowUp) : null}
              href={`/rep/opportunities`}
            />
          ))}
        </Section>
      )}

      {/* Overdue Lead Follow-ups */}
      {overdueLeads.length > 0 && (
        <Section label="Lead Follow-ups Due" count={overdueLeads.length} color="#a78bfa">
          {overdueLeads.map((l) => (
            <FollowUpCard
              key={l.id}
              title={l.hospitalName}
              subtitle={l.contactName ?? l.city ?? ""}
              badge={l.status}
              dueDate={l.nextFollowUp ? new Date(l.nextFollowUp) : null}
              href={`/rep/opportunities`}
            />
          ))}
        </Section>
      )}

      {/* All-clear state */}
      {totalActions === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎯</div>
          <p style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>Nothing overdue</p>
          <p style={{ fontSize: "0.82rem" }}>All your sources, opps, and leads are on track.</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, count, color, children }: {
  label: string; count: number; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 3, height: 18, borderRadius: 2, background: color, display: "inline-block" }} />
        <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--nyx-accent-label)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</p>
        <span style={{ marginLeft: "auto", background: color + "22", color, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{count}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function ActivityCard({ title, type, subtitle, time }: {
  title: string; type: string; subtitle: string; time?: string;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{ACTIVITY_EMOJI[type] ?? "📌"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.75rem", color: C.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {time && <span style={{ fontSize: "0.72rem", color: C.accent, fontWeight: 700, flexShrink: 0 }}>{time}</span>}
    </div>
  );
}

function SourceVisitCard({ id: _id, name, type, specialty, phone, city, state, daysSince, warmth, freqDays }: {
  id: string; name: string; type: string; specialty?: string; phone?: string;
  city?: string; state?: string; daysSince: number | null; warmth: number; freqDays: number;
}) {
  const overdueDays = daysSince !== null ? daysSince - freqDays : null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 1 }}>
            {[type.replace(/_/g, " "), specialty, city && state ? `${city}, ${state}` : state ?? city].filter(Boolean).join(" · ")}
          </div>
        </div>
        <WarmthDot score={warmth} />
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.7rem", color: "#f87171", fontWeight: 600 }}>
          {daysSince === null ? "Never visited" : `${daysSince}d since last touch`}
          {overdueDays !== null && overdueDays > 0 && ` · ${overdueDays}d overdue`}
        </span>
        {phone && (
          <a href={`tel:${phone}`}
            style={{ fontSize: "0.72rem", color: C.accent, fontWeight: 600, textDecoration: "none", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            📞 Call
          </a>
        )}
      </div>
    </div>
  );
}

function FollowUpCard({ title, subtitle, badge: _badge, dueDate, href }: {
  title: string; subtitle: string; badge: string; dueDate: Date | null; href: string;
}) {
  const isOverdue = dueDate && dueDate < new Date();
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ fontSize: "0.75rem", color: C.muted, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, background: isOverdue ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)", color: isOverdue ? "#f87171" : "#fbbf24", padding: "2px 7px", borderRadius: 6, display: "block", marginBottom: 4 }}>
            {isOverdue ? "Overdue" : "Due today"}
          </span>
          <span style={{ fontSize: "0.62rem", color: C.muted }}>
            {dueDate ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
