const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const integrations = [
  { name: "Stripe", desc: "Payment processing for invoices and rep commissions", icon: "💳", status: "connected", docs: "stripe.com" },
  { name: "Resend", desc: "Transactional email for notifications and digests", icon: "📧", status: "connected", docs: "resend.com" },
  { name: "Salesforce", desc: "Sync opportunities and accounts with Salesforce CRM", icon: "☁️", status: "available", docs: "salesforce.com" },
  { name: "Epic EHR", desc: "Integrate with Epic for clinical data context", icon: "🏥", status: "available", docs: "epic.com" },
  { name: "HubSpot", desc: "Sync contacts and marketing campaigns", icon: "🟠", status: "available", docs: "hubspot.com" },
  { name: "DocuSign", desc: "E-signature for contracts and compliance docs", icon: "✍️", status: "available", docs: "docusign.com" },
  { name: "Slack", desc: "Team notifications and pipeline alerts in Slack", icon: "💬", status: "available", docs: "slack.com" },
  { name: "Zapier", desc: "Connect NyxAegis to 5000+ apps via Zapier", icon: "⚡", status: "available", docs: "zapier.com" },
];

export default function IntegrationsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>SETTINGS</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Integrations</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>Connect NyxAegis with your existing healthcare tech stack</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {integrations.map((int) => (
          <div key={int.name} style={{ background: CARD, border: `1px solid ${int.status === "connected" ? "rgba(0,212,255,0.2)" : BORDER}`, borderRadius: 12, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: "1.8rem" }}>{int.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT }}>{int.name}</div>
                  {int.status === "connected" && <div style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: 600, letterSpacing: "0.08em" }}>● CONNECTED</div>}
                  {int.status === "available" && <div style={{ fontSize: "0.65rem", color: TEXT_MUTED, letterSpacing: "0.08em" }}>NOT CONNECTED</div>}
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", color: TEXT_MUTED, lineHeight: 1.5, marginBottom: 14 }}>{int.desc}</p>
            <button style={{ width: "100%", background: int.status === "connected" ? "rgba(239,68,68,0.06)" : "rgba(0,212,255,0.06)", border: `1px solid ${int.status === "connected" ? "rgba(239,68,68,0.15)" : "rgba(0,212,255,0.15)"}`, borderRadius: 6, padding: "8px", fontSize: "0.78rem", color: int.status === "connected" ? "#f87171" : CYAN, cursor: "pointer", fontWeight: 600 }}>
              {int.status === "connected" ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
