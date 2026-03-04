import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";

const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const statusColors: Record<string, string> = {
  DRAFT: "#94a3b8", SENT: "#fbbf24", PAID: "#34d399", OVERDUE: "#f87171", VOID: "#94a3b8",
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { hospital: { select: { hospitalName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalPending = invoices.filter(i => i.status === "SENT").reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + Number(i.totalAmount), 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>FINANCE</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Invoices</h1>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Paid", value: formatCurrency(totalPaid), color: "#34d399" },
          { label: "Pending", value: formatCurrency(totalPending), color: "#fbbf24" },
          { label: "Overdue", value: formatCurrency(totalOverdue), color: "#f87171" },
        ].map((s) => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Invoice #", "Hospital", "Amount", "Status", "Due Date", "Paid At"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "rgba(0,212,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: TEXT_MUTED }}>No invoices yet.</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: `1px solid rgba(0,212,255,0.04)` }}>
                <td style={{ padding: "13px 16px", fontWeight: 600, fontSize: "0.85rem", color: CYAN }}>{inv.invoiceNumber}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.85rem", color: TEXT }}>{inv.hospital.hospitalName}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.9rem", fontWeight: 700, color: TEXT }}>{formatCurrency(Number(inv.totalAmount))}</td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: statusColors[inv.status] ?? CYAN, background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 4 }}>{inv.status}</span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{formatDate(inv.dueDate)}</td>
                <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: inv.paidAt ? "#34d399" : TEXT_MUTED }}>{formatDate(inv.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
