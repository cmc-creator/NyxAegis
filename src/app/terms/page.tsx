import Link from "next/link";

const BG = "var(--nyx-bg)";
const CYAN = "var(--nyx-accent)";
const BORDER = "var(--nyx-accent-dim)";
const TEXT = "var(--nyx-text)";
const TEXT_MUTED = "var(--nyx-text-muted)";

const EFFECTIVE_DATE = "April 8, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    paragraphs: [
      "By accessing or using NyxAegis, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
      "If you do not agree to these Terms, you may not use the Service.",
      "These Terms apply to all users, including administrators, BD representatives, and hospital/account users.",
    ],
  },
  {
    id: "service",
    title: "2. Description of Service",
    paragraphs: [
      "NyxAegis is a hospital-focused CRM platform built for healthcare business development workflows.",
      "The Service supports account management, pipeline tracking, activity logging, compliance tracking, contracts, and reporting.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and Security",
    bullets: [
      "You are responsible for all activity under your account.",
      "You must keep credentials confidential and secure.",
      "You must promptly notify NyxAegis of unauthorized account access.",
      "Credential sharing with unauthorized users is prohibited.",
    ],
  },
  {
    id: "hipaa",
    title: "4. Healthcare Data and HIPAA",
    paragraphs: [
      "NyxAegis is designed to support HIPAA-conscious workflows.",
      "Unless a Business Associate Agreement (BAA) is executed, users must not upload or store Protected Health Information (PHI) in the platform.",
      "For BAA inquiries, contact ops@nyxaegis.com.",
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use",
    bullets: [
      "No unlawful use of the Service.",
      "No transmission of malware, spam, or abusive content.",
      "No unauthorized access attempts or security probing.",
      "No reverse engineering or source extraction attempts.",
      "No intentional disruption of platform performance or availability.",
    ],
  },
  {
    id: "billing",
    title: "6. Payment and Billing",
    paragraphs: [
      "Paid plans are billed monthly or annually as selected.",
      "Fees are non-refundable unless required by law or written agreement.",
      "NyxAegis may update pricing with at least 30 days notice.",
      "Non-payment may result in account limitation, suspension, or termination.",
    ],
  },
  {
    id: "data",
    title: "7. Data Ownership and Retention",
    paragraphs: [
      "You retain ownership of data you submit to NyxAegis.",
      "We do not sell your data.",
      "Following termination, you may request export within 30 days. After that period, data may be deleted according to retention policy.",
    ],
  },
  {
    id: "ip",
    title: "8. Intellectual Property",
    paragraphs: [
      "The Service, including software, branding, and platform content, is owned by NyxCollective LLC and protected by law.",
      "No rights are granted except the limited right to use the Service according to these Terms.",
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, NyxCollective LLC is not liable for indirect, incidental, special, consequential, or punitive damages.",
      "Total aggregate liability will not exceed fees paid by you for the Service in the prior 12 months.",
    ],
  },
  {
    id: "law",
    title: "10. Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of the State of Tennessee, without regard to conflict-of-law principles.",
      "Venue for disputes is in Davidson County, Tennessee, unless otherwise required by law.",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to Terms",
    paragraphs: [
      "We may modify these Terms from time to time.",
      "Material changes will be communicated through appropriate channels, including email or in-app notice.",
      "Continued use after the effective date of revised Terms constitutes acceptance.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact Information",
    paragraphs: [
      "Questions about these Terms can be sent to ops@nyxaegis.com.",
      "NyxCollective LLC, Nashville, Tennessee.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", minHeight: "100vh" }}>
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--nyx-bg)"/>
            <path d="M16 6 L26 12 L26 20 L16 26 L6 20 L6 12 Z" stroke={CYAN} strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
            <circle cx="16" cy="16" r="4" fill={CYAN} fillOpacity="0.8"/>
          </svg>
          <span style={{ fontWeight: 900, color: TEXT }}>NyxAegis</span>
        </Link>
        <div style={{ display: "flex", gap: 14, fontSize: "0.85rem" }}>
          <Link href="/privacy" style={{ color: TEXT_MUTED, textDecoration: "none" }}>Privacy</Link>
          <Link href="/signup" style={{ color: TEXT, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px" }}>Get Started</Link>
        </div>
      </nav>
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "42px 2rem 84px" }}>
        <header style={{ marginBottom: 26 }}>
          <p style={{ color: CYAN, fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 800, textTransform: "uppercase", marginBottom: 10 }}>
            Legal
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 900, marginBottom: 10 }}>Terms of Service</h1>
          <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.92rem" }}>Effective date: {EFFECTIVE_DATE}</p>
        </header>

        <section
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            background: "rgba(255,255,255,0.02)",
            padding: "18px 18px 12px",
            marginBottom: 26,
          }}
        >
          <p style={{ margin: 0, color: TEXT, fontWeight: 700, fontSize: "0.9rem" }}>Quick Navigation</p>
          <div style={{ marginTop: 12, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  textDecoration: "none",
                  color: TEXT_MUTED,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "9px 11px",
                  fontSize: "0.84rem",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                {section.title}
              </a>
            ))}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sections.map((section) => (
            <article
              id={section.id}
              key={section.id}
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: "20px 18px",
                background: "rgba(255,255,255,0.015)",
              }}
            >
              <h2 style={{ margin: "0 0 10px", fontSize: "1.03rem", fontWeight: 800 }}>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} style={{ margin: "0 0 10px", color: TEXT_MUTED, lineHeight: 1.74, fontSize: "0.93rem" }}>
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: TEXT_MUTED, lineHeight: 1.7, fontSize: "0.93rem" }}>
                  {section.bullets.map((item) => (
                    <li key={item} style={{ marginBottom: 8 }}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        <footer style={{ marginTop: 34, paddingTop: 20, borderTop: `1px solid ${BORDER}`, fontSize: "0.84rem", color: "rgba(216,232,244,0.4)", textAlign: "center", lineHeight: 1.7 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Back to NyxAegis</Link>
          {" · "}
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
          {" · "}
          <a href="mailto:ops@nyxaegis.com" style={{ color: "inherit", textDecoration: "none" }}>ops@nyxaegis.com</a>
          <div style={{ marginTop: 8 }}>NyxCollective LLC, Nashville, Tennessee</div>
        </footer>
      </main>
    </div>
  );
}
