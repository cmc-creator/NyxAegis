import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const statusColors: Record<string, string> = {
  NEW: "#00d4ff", CONTACTED: "#fbbf24", QUALIFIED: "#f59e0b",
  PROPOSAL_SENT: "#60a5fa", NEGOTIATING: "#60a5fa", WON: "#34d399", LOST: "#f87171", UNQUALIFIED: "#94a3b8",
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { assignedRep: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const newCount = leads.filter(l => l.status === "NEW").length;
  const qualifiedCount = leads.filter(l => l.status === "QUALIFIED").length;
  const wonCount = leads.filter(l => l.status === "WON").length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>PIPELINE</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Lead Pipeline</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>{leads.length} total leads</p>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ label: "New", value: newCount, color: CYAN }, { label: "Qualified", value: qualifiedCount, color: "#fbbf24" }, { label: "Won", value: wonCount, color: "#34d399" }].map((s) => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px", minWidth: 100 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Hospital", "Contact", "Status", "Source", "Est. Value", "Rep", "Created"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "rgba(0,212,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: TEXT_MUTED }}>No leads yet.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: `1px solid rgba(0,212,255,0.04)` }}>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: TEXT }}>{lead.hospitalName}</div>
                  {lead.state && <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{lead.city ? `${lead.city}, ` : ""}{lead.state}</div>}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ fontSize: "0.82rem", color: TEXT }}>{lead.contactName ?? "-"}</div>
                  <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{lead.contactTitle ?? ""}</div>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: statusColors[lead.status] ?? CYAN, background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 4 }}>{lead.status}</span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{lead.source.replace(/_/g, " ")}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.85rem", color: CYAN }}>{lead.estimatedValue ? formatCurrency(Number(lead.estimatedValue)) : "-"}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{lead.assignedRep?.user.name ?? "Unassigned"}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.78rem", color: TEXT_MUTED }}>{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
