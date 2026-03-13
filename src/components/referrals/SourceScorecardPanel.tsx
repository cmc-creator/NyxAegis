"use client";
import { useState, useEffect, useCallback } from "react";

const C = {
  accent: "var(--nyx-accent)",
  text:   "var(--nyx-text)",
  muted:  "var(--nyx-text-muted)",
  card:   "var(--nyx-card)",
  border: "var(--nyx-border)",
  dim:    "var(--nyx-accent-dim)",
  label:  "var(--nyx-accent-label)",
};

const ACTIVITY_EMOJI: Record<string, string> = {
  CALL:"📞", MEETING:"🤝", LUNCH:"🍽️", SITE_VISIT:"📍", EMAIL:"✉️",
  FOLLOW_UP:"🔔", CONFERENCE:"🎤", DEMO_COMPLETED:"🖥️", TASK:"✅",
  NOTE:"📝", PROPOSAL_SENT:"📄", CONTRACT_SENT:"📋",
};

type MonthDatum = { month: string; count: number };
type Activity = {
  id: string; type: string; title: string; notes?: string; createdAt: string;
  rep?: { user: { name?: string } };
};
type Scorecard = {
  warmthScore: number;
  warmthLabel: string;
  daysSinceLastActivity: number | null;
  activitiesLast30: number;
  referralsLast30: number;
  referralsPrev30: number;
  trend: number;
  totalReferrals: number;
  monthlyData: MonthDatum[];
  recentActivities: Activity[];
  lastActivity?: { createdAt: string; type: string; title: string } | null;
};
type Source = {
  id: string; name: string; type: string; specialty?: string; practiceName?: string;
  npi?: string; contactName?: string; email?: string; phone?: string;
  address?: string; city?: string; state?: string; zip?: string;
  monthlyGoal?: number; visitFrequencyDays?: number;
  notes?: string; active: boolean;
  assignedRep?: { user: { name?: string } };
};

function WarmthGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";
  const r = 30, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;
  const strokeDash = (score / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="15" fontWeight="800">{score}</text>
      </svg>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, color, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
    </div>
  );
}

function MiniBarChart({ data }: { data: MonthDatum[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 50 }}>
      {data.map((d) => (
        <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: "100%", background: d.count > 0 ? "var(--nyx-accent)" : "rgba(255,255,255,0.06)",
            height: Math.max(4, (d.count / max) * 42), borderRadius: "3px 3px 0 0",
            boxShadow: d.count > 0 ? "0 0 8px var(--nyx-accent-glow)" : "none",
            transition: "height 0.4s ease" }} />
          <span style={{ fontSize: "0.55rem", color: C.muted, whiteSpace: "nowrap" }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export function SourceScorecardPanel({
  sourceId,
  onClose,
}: {
  sourceId: string;
  onClose: () => void;
}) {
  const [data, setData]   = useState<{ source: Source; scorecard: Scorecard } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/referral-sources/${sourceId}/scorecard`);
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  }, [sourceId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="nyx-scorecard-panel"
        style={{ width: "min(520px, 100vw)", height: "min(92vh, 100vh)", overflow: "hidden", display: "flex", flexDirection: "column",
          background: "var(--nyx-card)", borderLeft: "1px solid var(--nyx-border)",
          borderTop: "1px solid var(--nyx-border)", borderRadius: "16px 0 0 0" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: C.label, letterSpacing: "0.14em", textTransform: "uppercase" }}>Source Scorecard</p>
            {data && <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: C.text, marginTop: 2 }}>{data.source.name}</h2>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "1.3rem", lineHeight: 1, padding: "2px 6px" }}>×</button>
        </div>

        {loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: "0.875rem" }}>
            Loading…
          </div>
        )}

        {data && !loading && (
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
            {/* Identity */}
            <div style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
              <WarmthGauge score={data.scorecard.warmthScore} label={data.scorecard.warmthLabel} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.76rem", color: C.muted, marginBottom: 4 }}>
                  {[data.source.type.replace(/_/g, " "), data.source.specialty, data.source.practiceName].filter(Boolean).join(" · ")}
                </div>
                {data.source.contactName && (
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: C.text, marginBottom: 2 }}>{data.source.contactName}</div>
                )}
                {(data.source.city || data.source.state) && (
                  <div style={{ fontSize: "0.72rem", color: C.muted }}>{[data.source.city, data.source.state].filter(Boolean).join(", ")}</div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {data.source.phone && (
                    <a href={`tel:${data.source.phone}`}
                      style={{ fontSize: "0.72rem", background: "rgba(0,212,255,0.08)", border: "1px solid var(--nyx-accent-dim)", borderRadius: 6, padding: "4px 10px", color: C.accent, textDecoration: "none", fontWeight: 600 }}>
                      📞 {data.source.phone}
                    </a>
                  )}
                  {data.source.email && (
                    <a href={`mailto:${data.source.email}`}
                      style={{ fontSize: "0.72rem", background: "rgba(0,212,255,0.08)", border: "1px solid var(--nyx-accent-dim)", borderRadius: 6, padding: "4px 10px", color: C.accent, textDecoration: "none", fontWeight: 600 }}>
                      ✉️ Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total Referrals", value: data.scorecard.totalReferrals, color: C.accent },
                { label: "Last 30 Days",    value: data.scorecard.referralsLast30,
                  color: data.scorecard.trend > 0 ? "#34d399" : data.scorecard.trend < 0 ? "#f87171" : C.accent,
                  suffix: data.scorecard.trend > 0 ? ` ▲${data.scorecard.trend}` : data.scorecard.trend < 0 ? ` ▼${Math.abs(data.scorecard.trend)}` : "" },
                { label: "Days Since Visit",
                  value: data.scorecard.daysSinceLastActivity !== null ? `${data.scorecard.daysSinceLastActivity}d` : "—",
                  color: data.scorecard.daysSinceLastActivity === null ? "#f87171"
                       : data.scorecard.daysSinceLastActivity <= 14 ? "#34d399"
                       : data.scorecard.daysSinceLastActivity <= 30 ? "#fbbf24" : "#f87171" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, color: s.color, lineHeight: 1, textShadow: `0 0 16px ${s.color}40` }}>
                    {s.value}{(s as { suffix?: string }).suffix ?? ""}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: C.muted, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Monthly referral chart */}
            <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: C.label, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Referrals (6 months)</p>
              <MiniBarChart data={data.scorecard.monthlyData} />
            </div>

            {/* Notes */}
            {data.source.notes && (
              <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, color: C.label, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Notes</p>
                <p style={{ fontSize: "0.8rem", color: C.text, lineHeight: 1.5 }}>{data.source.notes}</p>
              </div>
            )}

            {/* Activity timeline */}
            <div>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: C.label, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Recent Activity</p>
              {data.scorecard.recentActivities.length === 0 && (
                <p style={{ fontSize: "0.82rem", color: C.muted }}>No activities logged yet.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.scorecard.recentActivities.map((a) => (
                  <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>{ACTIVITY_EMOJI[a.type] ?? "📌"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.8rem", color: C.text }}>{a.title}</div>
                      {a.notes && <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{a.notes}</div>}
                      <div style={{ fontSize: "0.65rem", color: C.label, marginTop: 3 }}>
                        {a.rep?.user?.name && <span>{a.rep.user.name} · </span>}
                        {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
