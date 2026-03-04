import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const statusColor: Record<string, string> = {
  ACTIVE: "#34d399", INACTIVE: "#94a3b8", PENDING_REVIEW: "#fbbf24", SUSPENDED: "#f87171",
};

export default async function RepsPage() {
  const reps = await prisma.rep.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { opportunities: true, territories: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>BD TEAM</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>BD Representatives</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>{reps.length} reps on your team</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {reps.length === 0 && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32, textAlign: "center", color: TEXT_MUTED }}>No reps yet.</div>
        )}
        {reps.map((rep) => (
          <div key={rep.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,212,255,0.12)", border: `1px solid rgba(0,212,255,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: CYAN }}>
                  {(rep.user.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT }}>{rep.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{rep.title ?? "BD Rep"}</div>
                </div>
              </div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: statusColor[rep.status] ?? CYAN, background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 4 }}>{rep.status.replace("_", " ")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: CYAN }}>{rep._count.opportunities}</div>
                <div style={{ fontSize: "0.68rem", color: TEXT_MUTED }}>Opportunities</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: CYAN }}>{rep._count.territories}</div>
                <div style={{ fontSize: "0.68rem", color: TEXT_MUTED }}>Territories</div>
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>
              {rep.territory && <div>📍 {rep.territory}</div>}
              {rep.hipaaTrainedAt && <div style={{ color: "#34d399", marginTop: 4 }}>✓ HIPAA Trained {formatDate(rep.hipaaTrainedAt)}</div>}
            </div>
            <div style={{ marginTop: 10, fontSize: "0.72rem", color: "rgba(216,232,244,0.3)" }}>{rep.user.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
