import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const STAGES = ["DISCOVERY", "QUALIFICATION", "DEMO", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];

const stageColors: Record<string, { bg: string; color: string }> = {
  DISCOVERY: { bg: "rgba(148,163,184,0.08)", color: "#94a3b8" },
  QUALIFICATION: { bg: "rgba(245,158,11,0.08)", color: "#fbbf24" },
  DEMO: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  PROPOSAL: { bg: "rgba(0,212,255,0.08)", color: "#00d4ff" },
  NEGOTIATION: { bg: "rgba(96,165,250,0.08)", color: "#60a5fa" },
  CLOSED_WON: { bg: "rgba(52,211,153,0.08)", color: "#34d399" },
  CLOSED_LOST: { bg: "rgba(248,113,113,0.08)", color: "#f87171" },
};

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    include: {
      hospital: { select: { hospitalName: true } },
      assignedRep: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage] = opportunities.filter((o) => o.stage === stage);
    return acc;
  }, {} as Record<string, typeof opportunities>);

  const totalValue = opportunities.filter(o => o.stage === "CLOSED_WON").reduce((sum, o) => sum + (o.value ? Number(o.value) : 0), 0);
  const pipelineValue = opportunities.filter(o => !["CLOSED_WON", "CLOSED_LOST"].includes(o.stage)).reduce((sum, o) => sum + (o.value ? Number(o.value) : 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>PIPELINE</p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Opportunities</h1>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: CYAN }}>{formatCurrency(pipelineValue)}</div>
            <div style={{ fontSize: "0.68rem", color: TEXT_MUTED }}>Pipeline Value</div>
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#34d399" }}>{formatCurrency(totalValue)}</div>
            <div style={{ fontSize: "0.68rem", color: TEXT_MUTED }}>Closed Won</div>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
        {STAGES.map((stage) => {
          const cols = stageColors[stage] ?? { bg: "rgba(255,255,255,0.03)", color: "#94a3b8" };
          const items = byStage[stage] ?? [];
          return (
            <div key={stage} style={{ minWidth: 220, flex: "0 0 220px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: cols.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{stage.replace("_", " ")}</span>
                <span style={{ fontSize: "0.7rem", background: cols.bg, color: cols.color, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((opp) => (
                  <div key={opp.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: TEXT, marginBottom: 4 }}>{opp.title}</div>
                    <div style={{ fontSize: "0.72rem", color: TEXT_MUTED, marginBottom: 6 }}>{opp.hospital.hospitalName}</div>
                    {opp.value && <div style={{ fontSize: "0.8rem", fontWeight: 700, color: CYAN }}>{formatCurrency(Number(opp.value))}</div>}
                    {opp.assignedRep && <div style={{ fontSize: "0.68rem", color: TEXT_MUTED, marginTop: 4 }}>👤 {opp.assignedRep.user.name}</div>}
                  </div>
                ))}
                {items.length === 0 && <div style={{ padding: 12, fontSize: "0.78rem", color: "rgba(216,232,244,0.2)", textAlign: "center", border: `1px dashed rgba(0,212,255,0.08)`, borderRadius: 8 }}>Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
