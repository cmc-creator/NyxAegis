const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>SETTINGS</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Settings</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>Organization and platform configuration</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
        {[
          { section: "Organization", fields: [{ label: "Organization Name", value: "NyxAegis", type: "text" }, { label: "Support Email", value: "ops@nyxaegis.com", type: "email" }, { label: "Primary Color", value: "#00d4ff", type: "text" }] },
          { section: "Notifications", fields: [{ label: "New Lead Email", value: "enabled", type: "toggle" }, { label: "Weekly Pipeline Digest", value: "enabled", type: "toggle" }, { label: "Contract Expiration Alerts", value: "enabled", type: "toggle" }] },
          { section: "Security", fields: [{ label: "Require 2FA for Admins", value: "disabled", type: "toggle" }, { label: "Session Timeout (hours)", value: "24", type: "text" }] },
        ].map((s) => (
          <div key={s.section} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(0,212,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>{s.section}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {s.fields.map((f) => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.875rem", color: TEXT_MUTED }}>{f.label}</label>
                  {f.type === "toggle" ? (
                    <div style={{ background: f.value === "enabled" ? "rgba(0,212,255,0.15)" : "rgba(0,0,0,0.3)", border: `1px solid ${f.value === "enabled" ? "rgba(0,212,255,0.3)" : BORDER}`, borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, color: f.value === "enabled" ? CYAN : TEXT_MUTED }}>
                      {f.value === "enabled" ? "Enabled" : "Disabled"}
                    </div>
                  ) : (
                    <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", fontSize: "0.85rem", color: TEXT, minWidth: 200, textAlign: "right" }}>{f.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
