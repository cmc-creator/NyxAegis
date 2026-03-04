const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const reports = [
  { title: "Pipeline Summary", desc: "Opportunity counts and values by stage, rep, and service line", icon: "📊", badge: "PIPELINE" },
  { title: "Closed Won Report", desc: "All closed won opportunities with value, close date, and winning rep", icon: "✅", badge: "REVENUE" },
  { title: "Rep Performance", desc: "Activity volume, pipeline value, win rate per rep", icon: "🤝", badge: "TEAM" },
  { title: "Lead Source Analysis", desc: "Lead volume and conversion rates by source channel", icon: "🎯", badge: "LEADS" },
  { title: "Hospital Account Health", desc: "Account status, contract values, last activity dates", icon: "🏥", badge: "ACCOUNTS" },
  { title: "Contract Renewal Forecast", desc: "Upcoming contract expirations and renewal pipeline", icon: "📝", badge: "CONTRACTS" },
  { title: "Compliance Status", desc: "Rep compliance document statuses and upcoming expirations", icon: "🛡️", badge: "COMPLIANCE" },
  { title: "Revenue Forecast", desc: "Weighted pipeline forecast by probability and close date", icon: "💰", badge: "FINANCE" },
];

export default function ReportsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>INTELLIGENCE</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Reports</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>Export and schedule BD performance reports</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {reports.map((r) => (
          <div key={r.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: "1.8rem" }}>{r.icon}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: CYAN, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.08em" }}>{r.badge}</span>
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: TEXT, marginBottom: 6 }}>{r.title}</h3>
            <p style={{ fontSize: "0.82rem", color: TEXT_MUTED, lineHeight: 1.5, marginBottom: 14 }}>{r.desc}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 6, padding: "7px", fontSize: "0.75rem", color: CYAN, cursor: "pointer", fontWeight: 600 }}>Export CSV</button>
              <button style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px", fontSize: "0.75rem", color: TEXT_MUTED, cursor: "pointer" }}>Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
