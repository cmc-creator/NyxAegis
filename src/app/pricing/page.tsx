import Link from "next/link";

const CYAN   = "var(--nyx-accent)";
const BG     = "var(--nyx-bg)";
const BORDER = "var(--nyx-accent-dim)";
const TEXT   = "var(--nyx-text)";
const MUTED  = "rgba(216,232,244,0.5)";

const tiers = [
  {
    name: "Solo Rep",
    price: "$49",
    period: "/mo",
    desc: "For independent BD reps managing their own book of business.",
    badge: null as string | null,
    features: [
      "Up to 50 accounts",
      "100 opportunities",
      "Activity logging (calls, emails, notes)",
      "Document storage (1 GB)",
      "Mobile rep portal",
      "Basic analytics",
      "Email support",
    ],
    notIncluded: ["Team collaboration", "Territory management", "Custom branding"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: false,
  },
  {
    name: "BD Team",
    price: "$199",
    period: "/mo",
    desc: "For BD teams of 2–10 reps with shared pipeline and reporting.",
    badge: "MOST POPULAR" as string | null,
    features: [
      "Unlimited accounts",
      "Unlimited opportunities",
      "Full team pipeline & analytics",
      "Territory management & maps",
      "Rep performance dashboards",
      "Contract management",
      "HIPAA compliance doc vault",
      "Lead pipeline with source tracking",
      "Invoicing & payment tracking",
      "Aegis AI assistant",
      "Priority email + chat support",
      "10 GB document storage",
    ],
    notIncluded: ["White-label branding", "SSO / SAML", "Dedicated CSM"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Health System",
    price: "Custom",
    period: "",
    desc: "For enterprise health systems and large BD organizations (10+ reps).",
    badge: "ENTERPRISE" as string | null,
    features: [
      "Everything in BD Team",
      "White-label branding",
      "SSO / SAML authentication",
      "Custom integrations (Salesforce, Epic)",
      "Dedicated Customer Success Manager",
      "SLA guarantee (99.9% uptime)",
      "Custom reporting & BI exports",
      "Unlimited document storage",
      "Audit logs & compliance reports",
      "24/7 priority support",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    href: "mailto:ops@nyxaegis.com",
    highlight: false,
  },
];

const compareCols = ["Solo Rep", "BD Team", "Health System"];
const compareRows: { label: string; vals: (boolean | string)[] }[] = [
  { label: "Accounts",          vals: ["Up to 50",     "Unlimited",     "Unlimited"] },
  { label: "Opportunities",     vals: ["Up to 100",    "Unlimited",     "Unlimited"] },
  { label: "BD Reps",           vals: ["1",             "Up to 10",     "Unlimited"] },
  { label: "Activity logging",  vals: [true,            true,            true] },
  { label: "Territory maps",    vals: [false,           true,            true] },
  { label: "HIPAA vault",       vals: [false,           true,            true] },
  { label: "Aegis AI",          vals: [false,           true,            true] },
  { label: "Analytics",         vals: ["Basic",         "Full",          "Custom"] },
  { label: "Invoicing",         vals: [false,           true,            true] },
  { label: "White-label",       vals: [false,           false,           true] },
  { label: "SSO / SAML",        vals: [false,           false,           true] },
  { label: "Dedicated CSM",     vals: [false,           false,           true] },
  { label: "Support",           vals: ["Email",         "Email + Chat",  "24/7 Priority"] },
  { label: "Storage",           vals: ["1 GB",          "10 GB",         "Unlimited"] },
];

const faqs = [
  { q: "Is NyxAegis HIPAA compliant?", a: "NyxAegis is designed with HIPAA requirements in mind. We provide BAA templates, HIPAA training doc storage, and encrypt data at rest and in transit. Contact us for a BAA." },
  { q: "Can I try NyxAegis before paying?", a: "Yes — all plans include a 14-day free trial with no credit card required. You will have full access to all features in your chosen plan." },
  { q: "What counts as an account?", a: "Each distinct facility or health system entity counts as one account. A 10-facility IDN counts as 10 accounts on Solo Rep, or is unlimited on BD Team and above." },
  { q: "Can I add more BD reps?", a: "BD Team supports up to 10 reps. Additional rep seats are $25/rep/mo. Health System plans include unlimited reps." },
  { q: "Do you offer nonprofit discounts?", a: "Yes — contact ops@nyxaegis.com for nonprofit, academic, or government healthcare pricing." },
  { q: "What integrations do you support?", a: "Health System plans include custom integration development. We currently support Stripe, Resend, and have open APIs for CRM, EHR, and BI tools." },
];

function Check({ ok }: { ok: boolean | string }) {
  if (typeof ok === "string") return <span style={{ fontSize: "0.8rem", color: TEXT }}>{ok}</span>;
  if (ok) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(216,232,244,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

const trust = [
  { label: "HIPAA Ready", icon: "🔐" },
  { label: "SOC 2 Type II", icon: "✅" },
  { label: "99.9% Uptime SLA", icon: "⚡" },
  { label: "14-Day Free Trial", icon: "🎯" },
  { label: "Cancel Anytime", icon: "🔓" },
  { label: "US-Based Support", icon: "🇺🇸" },
];

export default function PricingPage() {
  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, background: "rgba(5,8,12,0.85)", backdropFilter: "blur(16px)", zIndex: 50 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M16 6 L26 12 L26 20 L16 26 L6 20 L6 12 Z" stroke={CYAN} strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
            <circle cx="16" cy="16" r="4" fill={CYAN} fillOpacity="0.8"/>
          </svg>
          <span style={{ fontWeight: 900, color: TEXT }}>NyxAegis</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/login" style={{ color: MUTED, textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, padding: "6px 12px" }}>Sign In</Link>
          <Link href="/signup" style={{ background: CYAN, color: BG, padding: "7px 18px", borderRadius: 7, fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "72px 2rem 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 300, background: "radial-gradient(ellipse at center, rgba(11,90,180,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <p style={{ color: CYAN, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>PRICING</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, color: TEXT, letterSpacing: "-0.03em", marginBottom: 18, lineHeight: 1.08 }}>
          Simple, transparent pricing<br />
          <span style={{ color: CYAN }}>for healthcare BD teams.</span>
        </h1>
        <p style={{ color: MUTED, maxWidth: 500, margin: "0 auto 32px", fontSize: "1rem", lineHeight: 1.7 }}>
          No per-account charges. No hidden fees. 14-day free trial on every plan.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 680, margin: "0 auto" }}>
          {trust.map(t => (
            <span key={t.label} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "5px 12px", fontSize: "0.72rem", color: MUTED, whiteSpace: "nowrap" }}>
              {t.icon} {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* TIER CARDS */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 2rem 56px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
        {tiers.map((t) => (
          <div key={t.name} style={{ background: t.highlight ? "rgba(11,90,180,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${t.highlight ? "rgba(11,90,180,0.5)" : BORDER}`, borderRadius: 16, padding: "32px 28px", display: "flex", flexDirection: "column", position: "relative", boxShadow: t.highlight ? "0 0 40px rgba(11,90,180,0.12)" : "none" }}>
            {t.badge && (
              <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: t.highlight ? CYAN : "rgba(255,255,255,0.08)", color: t.highlight ? BG : MUTED, padding: "3px 14px", borderRadius: "0 0 8px 8px", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                {t.badge}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: CYAN, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, marginTop: t.badge ? 10 : 0 }}>{t.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: TEXT, lineHeight: 1, letterSpacing: "-0.03em" }}>{t.price}</span>
                {t.period && <span style={{ color: MUTED, fontSize: "0.9rem" }}>{t.period}</span>}
              </div>
              <p style={{ fontSize: "0.85rem", color: MUTED, marginBottom: 28, lineHeight: 1.55 }}>{t.desc}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {t.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: "0.85rem", color: "rgba(216,232,244,0.75)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
                {t.notIncluded.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: "0.85rem", color: "rgba(216,232,244,0.2)", textDecoration: "line-through" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(216,232,244,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link href={t.href} style={{ display: "block", textAlign: "center", background: t.highlight ? CYAN : "rgba(255,255,255,0.05)", color: t.highlight ? BG : TEXT, padding: "13px", borderRadius: 9, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem", border: t.highlight ? "none" : `1px solid ${BORDER}` }}>
              {t.cta}
            </Link>
            <p style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(216,232,244,0.28)", marginTop: 10 }}>
              {t.price === "Custom" ? "No commitment required" : "14-day free trial · no card required"}
            </p>
          </div>
        ))}
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem 72px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: TEXT, marginBottom: 28, textAlign: "center" }}>Feature Comparison</h2>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ padding: "14px 20px", fontSize: "0.68rem", fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Feature</div>
            {compareCols.map((c, i) => (
              <div key={c} style={{ padding: "14px 12px", textAlign: "center", fontSize: "0.68rem", fontWeight: 800, color: i === 1 ? CYAN : MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c}</div>
            ))}
          </div>
          {compareRows.map((row, idx) => (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: idx < compareRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              <div style={{ padding: "12px 20px", fontSize: "0.82rem", color: "rgba(216,232,244,0.6)" }}>{row.label}</div>
              {row.vals.map((v, i) => (
                <div key={i} style={{ padding: "12px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check ok={v} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 72px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: TEXT, marginBottom: 28, textAlign: "center" }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq) => (
            <div key={faq.q} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: TEXT, marginBottom: 8 }}>{faq.q}</h3>
              <p style={{ fontSize: "0.85rem", color: MUTED, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ maxWidth: 720, margin: "0 auto 72px", padding: "0 2rem" }}>
        <div style={{ background: "rgba(11,90,180,0.1)", border: "1px solid rgba(11,90,180,0.35)", borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>Ready to grow faster?</h2>
          <p style={{ color: MUTED, marginBottom: 28, lineHeight: 1.6 }}>Join BD teams using NyxAegis to manage their pipeline, track referrals, and close more contracts.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ background: CYAN, color: BG, padding: "12px 28px", borderRadius: 9, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>Start Free Trial</Link>
            <a href="mailto:ops@nyxaegis.com" style={{ background: "transparent", color: TEXT, padding: "12px 28px", borderRadius: 9, fontWeight: 600, textDecoration: "none", fontSize: "0.95rem", border: `1px solid ${BORDER}` }}>Talk to Sales</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "24px 2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.78rem", color: "rgba(216,232,244,0.22)" }}>
          {"\u00A9"} 2026 NyxCollective LLC {"·"}{" "}
          <Link href="/terms" style={{ color: "inherit" }}>Terms</Link> {"·"}{" "}
          <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link> {"·"}{" "}
          <a href="mailto:ops@nyxaegis.com" style={{ color: "inherit" }}>ops@nyxaegis.com</a>
        </p>
      </footer>

    </div>
  );
}