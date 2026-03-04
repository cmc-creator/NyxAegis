const CYAN = "#00d4ff";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const upcoming = [
  { type: "MEETING", title: "Quarterly Business Review - Nashville General", date: "Jan 8, 2026", time: "10:00 AM", rep: "Jordan Rivera", hospital: "Nashville General" },
  { type: "DEMO", title: "Product Demo - Cardiology Revenue Cycle", date: "Jan 9, 2026", time: "2:00 PM", rep: "Jordan Rivera", hospital: "Vanderbilt Health" },
  { type: "SITE_VISIT", title: "On-site Visit - Baptist Hospital Memphis", date: "Jan 12, 2026", time: "9:00 AM", rep: "Jordan Rivera", hospital: "Baptist Hospital" },
  { type: "CALL", title: "Follow-up Call - St. Thomas Health", date: "Jan 13, 2026", time: "11:30 AM", rep: "Unassigned", hospital: "St. Thomas Health" },
  { type: "CONFERENCE", title: "HFMA Annual Conference - Las Vegas", date: "Jan 20-22, 2026", time: "All day", rep: "Team", hospital: "-" },
];

const typeColors: Record<string, string> = {
  MEETING: "#60a5fa", DEMO: "#fbbf24", SITE_VISIT: "#34d399", CALL: "#00d4ff", CONFERENCE: "#a78bfa",
};

export default function CalendarPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(0,212,255,0.55)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>COMMAND</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>Calendar</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>Upcoming meetings, demos, and site visits</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {upcoming.map((event, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 4, height: 40, background: typeColors[event.type] ?? CYAN, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: TEXT, marginBottom: 3 }}>{event.title}</div>
                <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{event.hospital} · 👤 {event.rep}</div>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: TEXT }}>{event.date}</div>
              <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{event.time}</div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: typeColors[event.type] ?? CYAN, marginTop: 4, letterSpacing: "0.08em" }}>{event.type.replace("_", " ")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
