"use client";
import { useState } from "react";

export interface OverdueHospital {
  id: string;
  hospitalName: string;
  city?: string | null;
  state?: string | null;
  status: string;
  daysSinceActivity: number | null;
  contacts: Array<{
    id: string;
    name: string;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
  }>;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "var(--nyx-accent)",
  PROSPECT: "#fbbf24",
  INACTIVE: "#64748b",
};

export function OverdueInsightsPanel({ hospitals }: { hospitals: OverdueHospital[] }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/territory/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitals }),
      });
      const data = await res.json() as { suggestions?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to get suggestions");
      setSuggestions(data.suggestions ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!hospitals.length) return null;

  return (
    <div
      style={{
        background: "var(--nyx-card)",
        border: "1px solid rgba(251,146,60,0.25)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 20px",
          background: "none",
          border: "none",
          borderBottom: expanded ? "1px solid var(--nyx-accent-dim)" : "none",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.6rem", color: "#fb923c" }}>●</span>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--nyx-accent-label)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Locations Overdue for Contact
          </span>
          <span
            style={{
              background: "rgba(251,146,60,0.12)",
              border: "1px solid rgba(251,146,60,0.35)",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "#fb923c",
            }}
          >
            {hospitals.length}
          </span>
        </div>
        <span style={{ color: "var(--nyx-text-muted)", fontSize: "0.75rem" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "16px 20px 20px" }}>
          {/* Location list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {hospitals.map(h => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px",
                  background: "rgba(251,146,60,0.04)",
                  border: "1px solid rgba(251,146,60,0.12)",
                  borderRadius: 8,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: STATUS_COLOR[h.status] ?? "#64748b",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--nyx-text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {h.hospitalName}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--nyx-text-muted)", marginTop: 1 }}>
                      {[h.city, h.state].filter(Boolean).join(", ")}
                      {h.contacts.length > 0 && (
                        <span style={{ marginLeft: 8, color: "var(--nyx-accent-label)" }}>
                          {h.contacts[0].name}
                          {h.contacts[0].title ? ` — ${h.contacts[0].title}` : ""}
                          {h.contacts.length > 1 ? ` +${h.contacts.length - 1}` : ""}
                        </span>
                      )}
                      {h.contacts.length === 0 && (
                        <span style={{ marginLeft: 8, color: "rgba(251,146,60,0.7)" }}>no contacts on file</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#fb923c",
                      fontWeight: 700,
                      background: "rgba(251,146,60,0.1)",
                      borderRadius: 6,
                      padding: "3px 8px",
                    }}
                  >
                    {h.daysSinceActivity != null ? `${h.daysSinceActivity}d ago` : "Never"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--nyx-text-muted)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestions section */}
          <div style={{ marginTop: 18 }}>
            {!suggestions && (
              <button
                onClick={fetchSuggestions}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "11px 20px",
                  background: loading
                    ? "var(--nyx-accent-dim)"
                    : "linear-gradient(135deg, var(--nyx-accent-mid), var(--nyx-accent-dim))",
                  border: "1px solid var(--nyx-accent-str)",
                  borderRadius: 9,
                  color: "var(--nyx-accent)",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                  transition: "opacity 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 13,
                        height: 13,
                        border: "2px solid var(--nyx-accent)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "nyx-spin 0.7s linear infinite",
                      }}
                    />
                    Analyzing {hospitals.length} locations…
                  </>
                ) : (
                  <>✦ Get AI Outreach Suggestions</>
                )}
              </button>
            )}

            {error && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 8,
                  color: "#f87171",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </div>
            )}

            {suggestions && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "var(--nyx-accent-label)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    ✦ AI Outreach Recommendations
                  </p>
                  <button
                    onClick={() => { setSuggestions(null); setError(null); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--nyx-text-muted)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontFamily: "inherit",
                    }}
                  >
                    Regenerate
                  </button>
                </div>
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--nyx-accent-dim)",
                    borderRadius: 10,
                    padding: "16px 18px",
                    fontSize: "0.84rem",
                    lineHeight: 1.78,
                    color: "var(--nyx-text)",
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                  }}
                >
                  {suggestions}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes nyx-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
