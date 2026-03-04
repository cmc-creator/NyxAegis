import { prisma } from "@/lib/prisma";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

export default async function TerritoryPage() {
  const reps = await prisma.rep.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { name: true } },
      territories: true,
      _count: { select: { opportunities: true } },
    },
  });

  const territories = await prisma.repTerritory.findMany({
    include: { rep: { include: { user: { select: { name: true } } } } },
    orderBy: { state: "asc" },
  });

  const statesByRep = reps.map(rep => ({
    rep,
    states: [...new Set([
      ...(rep.licensedStates ?? []),
      ...rep.territories.map(t => t.state),
    ])],
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>BD TEAM</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Territory Management</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>Rep territory coverage across the US</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
        {statesByRep.map(({ rep, states }) => (
          <div key={rep.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT }}>{rep.user.name}</div>
                <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{rep.territory ?? "No territory set"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: CYAN }}>{rep._count.opportunities}</div>
                <div style={{ fontSize: "0.65rem", color: TEXT_MUTED }}>opps</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {states.length === 0 ? (
                <span style={{ fontSize: "0.78rem", color: TEXT_MUTED }}>No states assigned</span>
              ) : states.map(state => (
                <span key={state} style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 4, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 700, color: CYAN }}>{state}</span>
              ))}
            </div>
          </div>
        ))}
        {reps.length === 0 && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32, textAlign: "center", color: TEXT_MUTED }}>No active reps yet.</div>
        )}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["State", "Region", "Rep", "City", "Notes"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "rgba(0,212,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {territories.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: TEXT_MUTED }}>No territories defined yet.</td></tr>
            )}
            {territories.map((t) => (
              <tr key={t.id} style={{ borderBottom: `1px solid rgba(0,212,255,0.04)` }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.85rem", color: CYAN }}>{t.state}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{t.region ?? "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: TEXT }}>{t.rep.user.name}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{t.city ?? "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: TEXT_MUTED }}>{t.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
