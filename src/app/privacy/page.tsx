import Link from "next/link";

const BG = "var(--nyx-bg)";
const CYAN = "var(--nyx-accent)";
const BORDER = "var(--nyx-accent-dim)";
const TEXT = "var(--nyx-text)";
const TEXT_MUTED = "var(--nyx-text-muted)";

const EFFECTIVE_DATE = "April 8, 2026";

const sections = [
  {
    id: "collect",
    title: "1. Information We Collect",
    paragraphs: [
      "We collect information you provide directly, including account details, organization information, profile settings, and CRM-related records.",
      "We also collect operational metadata such as usage logs, device/browser data, and performance telemetry needed to secure and improve the platform.",
    ],
  },
  {
    id: "use",
    title: "2. How We Use Information",
    bullets: [
      "Operate and maintain NyxAegis services",
      "Provide account, billing, and support functionality",
      "Deliver transactional communications and product notices",
      "Improve platform performance, reliability, and security",
      "Meet legal and compliance obligations",
    ],
  },
  {
    id: "hipaa",
    title: "3. HIPAA and Protected Health Information",
    paragraphs: [
      "NyxAegis is designed for healthcare business development workflows and is not intended as a clinical system of record.",
      "Do not store Protected Health Information (PHI) unless a Business Associate Agreement (BAA) has been executed.",
      "For BAA requests, contact ops@nyxaegis.com.",
    ],
  },
  {
    id: "sharing",
    title: "4. Data Sharing",
    paragraphs: [
      "We share data only with service providers required to run the platform, such as payment processing, transactional email, and hosting infrastructure.",
      "We do not sell customer or user data.",
      "We may disclose data if required by law, legal process, or to protect rights and safety.",
    ],
  },
  {
    id: "security",
    title: "5. Security",
    paragraphs: [
      "NyxAegis uses industry-standard controls including encrypted transport, access controls, and security monitoring.",
      "No system can guarantee absolute security, but we continuously improve our safeguards and incident response practices.",
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    paragraphs: [
      "We retain account data while your subscription remains active and as otherwise required for legitimate business operations.",
      "After termination, export may be requested within 30 days, after which data may be deleted according to policy and legal requirements.",
    ],
  },
  {
    id: "rights",
    title: "7. Your Rights",
    bullets: [
      "Access and review your personal data",
      "Request correction of inaccurate data",
      "Request deletion where legally permitted",
      "Request export in a portable format",
      "Manage communication preferences",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies and Similar Technologies",
    paragraphs: [
      "We use essential cookies for authentication, session continuity, and core platform operations.",
      "We may use limited analytics cookies to improve product performance and usability.",
      "Browser settings can be used to manage cookie behavior.",
    ],
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    paragraphs: [
      "NyxAegis is intended for professional use by adults and is not directed to children under 18.",
      "We do not knowingly collect personal information from minors.",
    ],
  },
  {
    id: "changes",
    title: "10. Policy Changes",
    paragraphs: [
      "We may update this Privacy Policy from time to time.",
      "Material updates will be communicated through appropriate channels including in-app notice or email.",
      "Continued use after an updated effective date means you accept the revised policy.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact Us",
    paragraphs: [
      "For privacy questions or data requests, contact ops@nyxaegis.com.",
      "For HIPAA-related inquiries, include 'HIPAA Inquiry' in the message subject.",
    ],
  },
];

export default function PrivacyPage() {
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
          <Link href="/terms" style={{ color: TEXT_MUTED, textDecoration: "none" }}>Terms</Link>
          <Link href="/signup" style={{ color: TEXT, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px" }}>Get Started</Link>
        </div>
      </nav>
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "42px 2rem 84px" }}>
        <header style={{ marginBottom: 26 }}>
          <p style={{ color: CYAN, fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 800, textTransform: "uppercase", marginBottom: 10 }}>
            Legal
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 900, marginBottom: 10 }}>Privacy Policy</h1>
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
        </div>

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
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
          {" · "}
          <a href="mailto:ops@nyxaegis.com" style={{ color: "inherit", textDecoration: "none" }}>ops@nyxaegis.com</a>
          <div style={{ marginTop: 8 }}>NyxCollective LLC, Nashville, Tennessee</div>
        </footer>
      </main>
    </div>
  );
}
