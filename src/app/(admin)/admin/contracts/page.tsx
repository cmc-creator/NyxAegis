import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const statusColors: Record<string, string> = {
  DRAFT: "#94a3b8", SENT: "#fbbf24", SIGNED: "#60a5fa", ACTIVE: "#34d399", EXPIRED: "#f87171", TERMINATED: "#f87171",
};

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      hospital: { select: { hospitalName: true } },
      assignedRep: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>FINANCE</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Contracts</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>{contracts.length} contracts</p>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Title", "Hospital", "Rep", "Status", "Value", "Start", "End"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "rgba(0,212,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: TEXT_MUTED }}>No contracts yet.</td></tr>
            )}
            {contracts.map((c) => (
              <tr key={c.id} style={{ borderBottom: `1px solid rgba(0,212,255,0.04)` }}>
                <td style={{ padding: "13px 16px", fontWeight: 600, fontSize: "0.875rem", color: TEXT }}>{c.title}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.85rem", color: TEXT_MUTED }}>{c.hospital.hospitalName}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{c.assignedRep?.user.name ?? "-"}</td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: statusColors[c.status] ?? CYAN, background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 4 }}>{c.status}</span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: "0.9rem", fontWeight: 700, color: CYAN }}>{c.value ? formatCurrency(Number(c.value)) : "-"}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.8rem", color: TEXT_MUTED }}>{formatDate(c.startDate)}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.8rem", color: TEXT_MUTED }}>{formatDate(c.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
