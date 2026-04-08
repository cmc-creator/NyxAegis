"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ─── Route → Page title map ────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  // REP
  "/rep/today":           "Today",
  "/rep/dashboard":       "Dashboard",
  "/rep/opportunities":   "My Pipeline",
  "/rep/territory":       "My Territory",
  "/rep/communications":  "Communications",
  "/rep/documents":       "Documents",
  "/rep/payments":        "Payments",
  // ADMIN
  "/admin/dashboard":           "Dashboard",
  "/admin/leads":               "Leads",
  "/admin/opportunities":       "Opportunities",
  "/admin/referral-sources":    "Referral Sources",
  "/admin/referrals":           "Referrals",
  "/admin/hospitals":           "Accounts",
  "/admin/reps":                "BD Reps",
  "/admin/calendar":            "Calendar",
  "/admin/analytics":           "Analytics",
  "/admin/reports":             "Reports",
  "/admin/invoices":            "Invoices",
  "/admin/contracts":           "Contracts",
  "/admin/communications":      "Communications",
  "/admin/settings":            "Settings",
  "/admin/territory":           "Territory Map",
  "/admin/notifications":       "Notifications",
  "/admin/audit":               "Audit Log",
  "/admin/integrations":        "Integrations",
  "/admin/compliance":          "Compliance",
  // ACCOUNT
  "/account/dashboard":    "Dashboard",
  "/account/engagements":  "Engagements",
  "/account/invoices":     "Invoices",
};

function getPageTitle(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  // Prefix match (e.g. /rep/today?source=xyz or /admin/leads/123)
  const match = Object.keys(ROUTE_LABELS)
    .filter(k => pathname.startsWith(k + "/") || pathname.startsWith(k + "?"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_LABELS[match] : "NyxAegis";
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface Props {
  role: string;
  userName?: string | null;
}

export function MobileTopBar({ role, userName }: Props) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const initials = getInitials(userName);

  const openMenu   = () => window.dispatchEvent(new CustomEvent("aegis:open-sidebar"));
  const openSearch = () => window.dispatchEvent(new CustomEvent("aegis:open-search"));
  const openLog    = () => window.dispatchEvent(new CustomEvent("aegis:open-quicklog"));

  return (
    <header className="nyx-topbar" aria-label="Top navigation">
      {/* Hamburger — opens slide-in sidebar */}
      <button className="nyx-topbar-btn" onClick={openMenu} aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Logo */}
      <div style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/Aegislogo.png" alt="NyxAegis" width={28} height={28} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
      </div>

      {/* Page title */}
      <span className="nyx-topbar-title">{title}</span>

      {/* Right actions */}
      <div className="nyx-topbar-actions">
        {/* Search */}
        <button className="nyx-topbar-btn" onClick={openSearch} aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Quick log — only for ADMIN and REP */}
        {role !== "ACCOUNT" && (
          <button
            className="nyx-topbar-btn nyx-topbar-log"
            onClick={openLog}
            aria-label="Quick log activity"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}

        {/* User avatar */}
        <div
          className="nyx-topbar-avatar"
          title={userName ?? "User"}
          aria-label={`User: ${userName ?? "User"}`}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
