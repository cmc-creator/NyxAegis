import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TerritoryMapWrapper from "@/components/maps/TerritoryMapWrapper";
import { OverdueInsightsPanel } from "@/components/maps/OverdueInsightsPanel";

const CYAN = "var(--nyx-accent)";
const CARD = "var(--nyx-card)";
const BORDER = "var(--nyx-accent-dim)";
const TEXT = "var(--nyx-text)";
const TEXT_MUTED = "var(--nyx-text-muted)";

export default async function RepTerritoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rep = await prisma.rep.findUnique({
    where: { userId: session.user.id },
    include: { territories: { orderBy: { state: "asc" } }, user: { select: { name: true } } },
  });
  if (!rep) redirect("/login");

  // All states the rep covers
  const repStates = Array.from(new Set([
    ...(rep.licensedStates ?? []),
    ...rep.territories.map(t => t.state),
  ]));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  // Fetch hospitals in territory + overdue check in parallel
  const [allHospitals] = await Promise.all([
    repStates.length > 0
      ? prisma.hospital.findMany({
          where: { state: { in: repStates }, status: { not: "INACTIVE" } },
          include: {
            activities: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { createdAt: true },
            },
            contacts: {
              take: 5,
              select: { id: true, name: true, title: true, email: true, phone: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const mapHospitals = allHospitals.map(h => ({
    id: h.id,
    hospitalName: h.hospitalName,
    city: h.city,
    state: h.state,
    status: h.status,
    assignedRepName: null,
  }));

  const overdueHospitals = allHospitals
    .filter(h =>
      h.activities.length === 0 ||
      h.activities[0].createdAt < thirtyDaysAgo
    )
    .map(h => ({
      id: h.id,
      hospitalName: h.hospitalName,
      city: h.city,
      state: h.state,
      status: h.status,
      lastActivityAt: h.activities[0]?.createdAt.toISOString() ?? null,
      daysSinceActivity:
        h.activities[0]
          ? Math.floor((Date.now() - h.activities[0].createdAt.getTime()) / 86400000)
          : null,
      contacts: h.contacts.map(c => ({
        id: c.id,
        name: c.name,
        title: c.title,
        email: c.email,
        phone: c.phone,
      })),
    }));

  const repTerritories = [{
    id: rep.id,
    name: rep.user.name ?? "Me",
    color: "var(--nyx-accent)",
    states: repStates,
  }];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "var(--nyx-accent-label)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>REP PORTAL</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: TEXT }}>My Territory</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4 }}>{rep.territory ?? "No territory assigned"}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: CYAN }}>{rep.licensedStates?.length ?? 0}</div>
          <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>Licensed States</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: CYAN }}>{rep.territories.length}</div>
          <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>Territory Assignments</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: CYAN }}>{allHospitals.length}</div>
          <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>Accounts in Territory</div>
        </div>
        {overdueHospitals.length > 0 && (
          <div style={{ background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 10, padding: "14px 20px" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fb923c" }}>{overdueHospitals.length}</div>
            <div style={{ fontSize: "0.72rem", color: TEXT_MUTED }}>Overdue (30d+)</div>
          </div>
        )}
      </div>

      {/* Licensed States */}
      {rep.licensedStates && rep.licensedStates.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--nyx-accent-label)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>LICENSED STATES</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {rep.licensedStates.map(state => (
              <span key={state} style={{ background: "var(--nyx-accent-dim)", border: "1px solid var(--nyx-accent-str)", borderRadius: 6, padding: "4px 12px", fontSize: "0.8rem", fontWeight: 700, color: CYAN }}>{state}</span>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map */}
      {repStates.length > 0 && (
        <div className="gold-card" style={{ borderRadius: 14, marginBottom: 20 }}>
          <div style={{ background: CARD, borderRadius: 14, padding: 24 }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--nyx-accent-label)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
              TERRITORY MAP
              {overdueHospitals.length > 0 && (
                <span style={{ marginLeft: 12, color: "#fb923c" }}>
                  · {overdueHospitals.length} overdue locations
                </span>
              )}
            </p>
            <div style={{ width: "100%", minHeight: 320, borderRadius: 10, overflow: "hidden" }}>
              <TerritoryMapWrapper
                hospitals={mapHospitals}
                repTerritories={repTerritories}
                overdueHospitals={overdueHospitals}
              />
            </div>
          </div>
        </div>
      )}

      {/* Overdue Insights + AI Suggestions */}
      {overdueHospitals.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <OverdueInsightsPanel hospitals={overdueHospitals} />
        </div>
      )}

      {/* Territory assignments table */}
      <div className="nyx-table-scroll" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["State", "Region", "City", "Notes"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "var(--nyx-accent-label)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rep.territories.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: TEXT_MUTED }}>No territory assignments yet. Contact your admin.</td></tr>
            )}
            {rep.territories.map((t) => (
              <tr key={t.id} style={{ borderBottom: `1px solid var(--nyx-accent-dim)` }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.85rem", color: CYAN }}>{t.state}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{t.region ?? "-"}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: TEXT_MUTED }}>{t.city ?? "-"}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: TEXT_MUTED }}>{t.notes ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
