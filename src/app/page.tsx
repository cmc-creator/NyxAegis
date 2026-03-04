import Link from "next/link";

const CYAN = "#00d4ff";
const BG = "#04080f";
const CARD_BG = "rgba(255,255,255,0.03)";
const BORDER = "rgba(0,212,255,0.08)";
const TEXT = "#d8e8f4";
const TEXT_MUTED = "rgba(216,232,244,0.55)";

const features = [
  { icon: "🏥", title: "Account Management", desc: "Manage hospital and health system accounts with full contact hierarchies, service lines, and relationship history. Track IDNs, GPOs, and multi-site health systems." },
  { icon: "📊", title: "Opportunity Pipeline", desc: "Visual Kanban pipeline from Discovery to Closed Won. Track deal values, close dates, service lines, and win/loss reasons across your entire BD team." },
  { icon: "🗺️", title: "Territory Management", desc: "Assign reps to geographic territories with state/region coverage maps. Visualize hospital density and whitespace opportunities across your target markets." },
  { icon: "🤝", title: "Rep Performance", desc: "Track BD rep KPIs: activity volume, pipeline velocity, win rates, and revenue closed. Identify your top performers and coach underperforming reps." },
  { icon: "📋", title: "Healthcare Compliance", desc: "Store HIPAA training certificates, state licenses, BAAs, NDAs, and insurance docs. Automated expiration alerts keep your team compliant." },
  { icon: "💰", title: "Revenue Analytics", desc: "Real-time dashboards for pipeline value, forecasted revenue, average deal size, and sales cycle length. Executive-ready reporting for C-suite presentations." },
  { icon: "📝", title: "Contract Management", desc: "Track MSAs, service agreements, and contract renewals. Never miss a contract expiration. Attach documents and track negotiation status." },
  { icon: "🔔", title: "Activity Tracking", desc: "Log calls, emails, meetings, demos, and site visits. Automated follow-up reminders. Full audit trail for every hospital engagement." },
  { icon: "📧", title: "Lead Pipeline", desc: "Capture and qualify inbound and outbound leads. Track source, estimated value, and conversion from prospect to active hospital account." },
];

const stats = [
  { value: "3", label: "Role Portals", sub: "Admin · Rep · Account" },
  { value: "HIPAA", label: "Ready", sub: "Compliance tracking built-in" },
  { value: "360°", label: "Account View", sub: "Full hospital relationship context" },
  { value: "24/7", label: "Pipeline Visibility", sub: "Real-time BD intelligence" },
];

const testimonials = [
  {
    quote: "NyxAegis transformed how our BD team tracks hospital relationships. We went from spreadsheets to a real pipeline with full visibility in one week.",
    name: "Michael Torres",
    title: "VP Business Development",
    org: "Southeast Health Partners",
  },
  {
    quote: "The territory management and rep performance features are exactly what we needed. Our regional directors now have real data to coach their teams.",
    name: "Jennifer Walsh",
    title: "Chief Growth Officer",
    org: "Meridian Health Systems",
  },
  {
    quote: "Finally a CRM built for healthcare BD — not a generic tool we had to hack together. The HIPAA compliance docs and contract tracking alone justified the switch.",
    name: "David Park",
    title: "Director of Hospital Partnerships",
    org: "NovaCare Solutions",
  },
];

const pricing = [
  {
    name: "Solo Rep",
    price: "$49",
    period: "/mo",
    desc: "For independent BD reps managing their own book of business",
    features: ["Up to 50 hospital accounts", "Opportunity pipeline", "Activity logging", "Document storage", "Mobile-friendly portal"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "BD Team",
    price: "$199",
    period: "/mo",
    desc: "For BD teams of 2–10 reps with shared pipeline and reporting",
    features: ["Unlimited hospital accounts", "Team pipeline & analytics", "Territory management", "Rep performance dashboards", "Contract management", "HIPAA compliance docs", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Health System",
    price: "Custom",
    period: "",
    desc: "For enterprise health systems and large BD organizations",
    features: ["Everything in BD Team", "White-label branding", "Custom integrations", "SSO / SAML", "Dedicated CSM", "SLA guarantee", "Custom reporting"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, background: "rgba(4,8,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#04080f"/>
            <rect x="1" y="1" width="30" height="30" rx="7" stroke={CYAN} strokeWidth="1" strokeOpacity="0.4"/>
            <path d="M16 6 L26 12 L26 20 L16 26 L6 20 L6 12 Z" stroke={CYAN} strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
            <circle cx="16" cy="16" r="4" fill={CYAN} fillOpacity="0.8"/>
          </svg>
          <span style={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT, letterSpacing: "-0.02em" }}>NyxAegis</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="/pricing" style={{ color: TEXT_MUTED, textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Pricing</Link>
          <Link href="/login" style={{ color: TEXT_MUTED, textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Sign In</Link>
          <Link href="/signup" style={{ background: CYAN, color: BG, padding: "8px 20px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 2rem 80px", textAlign: "center", maxWidth: 900, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 800px 400px at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,255,0.08)", border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 999, padding: "6px 16px", marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: CYAN, display: "inline-block" }} />
          <span style={{ fontSize: "0.8rem", color: CYAN, fontWeight: 600, letterSpacing: "0.08em" }}>HOSPITAL BUSINESS DEVELOPMENT PLATFORM</span>
        </div>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24, color: TEXT }}>
          The CRM built for<br />
          <span style={{ background: `linear-gradient(135deg, ${CYAN} 0%, #60a5fa 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            hospital business development
          </span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: TEXT_MUTED, maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7 }}>
          NyxAegis gives hospital BD teams a unified platform to manage accounts, track the pipeline, assign territories, and close more contracts — purpose-built for healthcare.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ background: CYAN, color: BG, padding: "14px 32px", borderRadius: 10, fontWeight: 800, textDecoration: "none", fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Start Free Trial →
          </Link>
          <Link href="/login" style={{ background: "rgba(255,255,255,0.04)", color: TEXT, padding: "14px 32px", borderRadius: 10, fontWeight: 600, textDecoration: "none", fontSize: "1rem", border: `1px solid ${BORDER}` }}>
            Sign In
          </Link>
        </div>
        <p style={{ marginTop: 16, fontSize: "0.8rem", color: TEXT_MUTED }}>No credit card required · 14-day free trial · Cancel anytime</p>
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "32px 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, textAlign: "center" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: CYAN, textShadow: `0 0 20px rgba(0,212,255,0.4)`, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: TEXT, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: CYAN, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>PLATFORM FEATURES</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>Everything your BD team needs</h2>
          <p style={{ color: TEXT_MUTED, marginTop: 12, fontSize: "1rem", maxWidth: 520, margin: "12px auto 0" }}>From prospect to signed contract, NyxAegis covers every stage of the hospital sales cycle.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", transition: "border-color 0.2s" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: "0.875rem", color: TEXT_MUTED, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 2rem", borderTop: `1px solid ${BORDER}`, background: "rgba(0,212,255,0.01)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: CYAN, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>THREE PORTALS</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: TEXT, letterSpacing: "-0.02em", marginBottom: 48 }}>Role-based access for every stakeholder</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { role: "ADMIN", icon: "⚙️", title: "Operations Command", desc: "Full visibility across all reps, hospitals, pipeline stages, revenue, and compliance. Build reports and manage the entire BD organization.", color: CYAN },
              { role: "REP", icon: "🤝", title: "Rep Dashboard", desc: "BD reps track their assigned hospitals, active opportunities, territory coverage, compliance documents, and commission payments.", color: "#60a5fa" },
              { role: "ACCOUNT", icon: "🏥", title: "Hospital Portal", desc: "Hospital contacts view engagement summaries, active proposals, invoices, and contract status. White-labeled for your brand.", color: "#34d399" },
            ].map((p) => (
              <div key={p.role} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{p.icon}</div>
                <div style={{ display: "inline-block", background: `rgba(0,212,255,0.08)`, border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 999, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700, color: p.color, letterSpacing: "0.1em", marginBottom: 12 }}>{p.role}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: TEXT, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: "0.875rem", color: TEXT_MUTED, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: CYAN, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>TESTIMONIALS</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, color: TEXT }}>Trusted by healthcare BD leaders</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px" }}>
              <div style={{ fontSize: "1.4rem", color: CYAN, marginBottom: 16 }}>&ldquo;</div>
              <p style={{ fontSize: "0.9rem", color: TEXT_MUTED, lineHeight: 1.7, marginBottom: 20 }}>{t.quote}</p>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT }}>{t.name}</div>
                <div style={{ fontSize: "0.8rem", color: TEXT_MUTED }}>{t.title}</div>
                <div style={{ fontSize: "0.8rem", color: CYAN, opacity: 0.7 }}>{t.org}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 2rem", borderTop: `1px solid ${BORDER}`, background: "rgba(0,212,255,0.01)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: CYAN, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>PRICING</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, color: TEXT }}>Simple, transparent pricing</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {pricing.map((p) => (
              <div key={p.name} style={{ background: p.highlight ? "rgba(0,212,255,0.05)" : CARD_BG, border: `1px solid ${p.highlight ? "rgba(0,212,255,0.3)" : BORDER}`, borderRadius: 12, padding: "32px 28px", position: "relative" }}>
                {p.highlight && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: CYAN, color: BG, padding: "4px 16px", borderRadius: "0 0 8px 8px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em" }}>MOST POPULAR</div>}
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: CYAN, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 900, color: TEXT }}>{p.price}</span>
                  <span style={{ color: TEXT_MUTED, fontSize: "0.9rem" }}>{p.period}</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: TEXT_MUTED, marginBottom: 24, lineHeight: 1.5 }}>{p.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.875rem", color: TEXT_MUTED }}>
                      <span style={{ color: CYAN, marginTop: 2 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{ display: "block", textAlign: "center", background: p.highlight ? CYAN : "rgba(255,255,255,0.06)", color: p.highlight ? BG : TEXT, padding: "12px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem", border: p.highlight ? "none" : `1px solid ${BORDER}` }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Ready to modernize your hospital BD operations?
          </h2>
          <p style={{ color: TEXT_MUTED, marginBottom: 32, fontSize: "1rem", lineHeight: 1.7 }}>
            Join healthcare BD teams using NyxAegis to close more contracts, manage more accounts, and grow faster.
          </p>
          <Link href="/signup" style={{ background: CYAN, color: BG, padding: "16px 40px", borderRadius: 10, fontWeight: 800, textDecoration: "none", fontSize: "1.05rem", display: "inline-block" }}>
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "32px 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#04080f"/>
              <path d="M16 6 L26 12 L26 20 L16 26 L6 20 L6 12 Z" stroke={CYAN} strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
              <circle cx="16" cy="16" r="4" fill={CYAN} fillOpacity="0.8"/>
            </svg>
            <span style={{ color: TEXT_MUTED, fontSize: "0.85rem" }}>© 2026 NyxCollective LLC</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/terms" style={{ color: TEXT_MUTED, textDecoration: "none", fontSize: "0.8rem" }}>Terms</Link>
            <Link href="/privacy" style={{ color: TEXT_MUTED, textDecoration: "none", fontSize: "0.8rem" }}>Privacy</Link>
            <Link href="/pricing" style={{ color: TEXT_MUTED, textDecoration: "none", fontSize: "0.8rem" }}>Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
