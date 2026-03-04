import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

export default async function AnalyticsPage() {
  const [oppsByStage, leadsByStatus, repStats, hospitalStats] = await Promise.all([
    prisma.opportunity.groupBy({ by: ["stage"], _count: { id: true }, _sum: { value: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.rep.findMany({ where: { status: "ACTIVE" }, include: { _count: { select: { opportunities: true, leads: true } }, user: { select: { name: true } } }, take: 10 }),
    prisma.hospital.groupBy({ by: ["hospitalType"], _count: { id: true } }),
  ]);

  const totalPipeline = oppsByStage.filter(o => !["CLOSED_WON", "CLOSED_LOST"].includes(o.stage)).reduce((s, o) => s + Number(o._sum.value ?? 0), 0);
  const closedWonValue = oppsByStage.find(o => o.stage === "CLOSED_WON")?._sum.value ?? 0;
  const winRate = (() => {
    const won = oppsByStage.find(o => o.stage === "CLOSED_WON")?._count.id ?? 0;
    const lost = oppsByStage.find(o => o.stage === "CLOSED_LOST")?._count.id ?? 0;
    const total = won + lost;
    return total > 0 ? Math.round((won / total) * 100) : 0;
  })();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>INTELLIGENCE</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Analytics</h1>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Pipeline Value", value: formatCurrency(totalPipeline), color: CYAN },
          { label: "Closed Won Value", value: formatCurrency(Number(closedWonValue)), color: "#34d399" },
          { label: "Win Rate", value: `${winRate}%`, color: "#fbbf24" },
          { label: "Active Leads", value: String(leadsByStatus.filter(l => ["NEW","CONTACTED","QUALIFIED"].includes(l.status)).reduce((s, l) => s + l._count.id, 0)), color: CYAN },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 18px" }}>
            <div style={{ fontSize: "1.7rem", fontWeight: 900, color: kpi.color, textShadow: "0 0 20px rgba(0,212,255,0.3)", marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Opportunities by Stage */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,212,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>OPPORTUNITIES BY STAGE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {oppsByStage.map((row) => (
              <div key={row.stage} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.8rem", color: TEXT_MUTED }}>{row.stage.replace(/_/g, " ")}</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: TEXT }}>{row._count.id}</span>
                  <span style={{ fontSize: "0.78rem", color: CYAN }}>{row._sum.value ? formatCurrency(Number(row._sum.value)) : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads by Status */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,212,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>LEADS BY STATUS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leadsByStatus.map((row) => (
              <div key={row.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.8rem", color: TEXT_MUTED }}>{row.status.replace(/_/g, " ")}</div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: TEXT }}>{row._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Reps */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,212,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>TOP BD REPS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {repStats.sort((a, b) => b._count.opportunities - a._count.opportunities).map((rep) => (
              <div key={rep.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.82rem", color: TEXT }}>{rep.user.name}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: "0.75rem", color: CYAN }}>{rep._count.opportunities} opps</span>
                  <span style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{rep._count.leads} leads</span>
                </div>
              </div>
            ))}
            {repStats.length === 0 && <div style={{ fontSize: "0.85rem", color: TEXT_MUTED }}>No rep data yet.</div>}
          </div>
        </div>

        {/* Hospital Mix */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,212,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>HOSPITAL MIX BY TYPE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hospitalStats.map((row) => (
              <div key={row.hospitalType} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.8rem", color: TEXT_MUTED }}>{row.hospitalType.replace(/_/g, " ")}</div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: TEXT }}>{row._count.id}</span>
              </div>
            ))}
            {hospitalStats.length === 0 && <div style={{ fontSize: "0.85rem", color: TEXT_MUTED }}>No hospital data yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
