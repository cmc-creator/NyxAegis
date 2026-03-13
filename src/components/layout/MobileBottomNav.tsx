"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconHome({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v10a1 1 0 0 1-1 1h-5v-5h-6v5H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function IconTarget({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={c} stroke="none" />
    </svg>
  );
}
function IconPipeline({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="13" width="4" height="8" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}
function IconMap({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function IconCalendar({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconReferral({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function IconInvoice({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="13" y2="12" />
      <path d="M12 17v2m-1-1h2" />
    </svg>
  );
}
function IconMenu({ active }: { active: boolean }) {
  const c = active ? "var(--nyx-accent)" : "var(--nyx-text-muted)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ─── Nav config per role ───────────────────────────────────────────────────────
type NavTab = {
  href?: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  action?: string; // special actions
};

const ADMIN_TABS: NavTab[] = [
  { href: "/admin/dashboard",       label: "Home",      icon: (a) => <IconHome active={a} /> },
  { href: "/admin/referral-sources", label: "Sources",   icon: (a) => <IconReferral active={a} /> },
  { href: "/admin/leads",           label: "Leads",     icon: (a) => <IconTarget active={a} /> },
  { href: "/admin/opportunities",   label: "Pipeline",  icon: (a) => <IconPipeline active={a} /> },
  { href: "/admin/calendar",        label: "Calendar",  icon: (a) => <IconCalendar active={a} /> },
];

const REP_TABS: NavTab[] = [
  { href: "/rep/today",             label: "Today",     icon: (a) => <IconCalendar active={a} /> },
  { href: "/rep/dashboard",         label: "Home",      icon: (a) => <IconHome active={a} /> },
  { href: "/rep/opportunities",     label: "Pipeline",  icon: (a) => <IconPipeline active={a} /> },
  { href: "/rep/territory",         label: "Territory", icon: (a) => <IconMap active={a} /> },
  { action: "menu",                 label: "More",      icon: (a) => <IconMenu active={a} /> },
];

const ACCOUNT_TABS: NavTab[] = [
  { href: "/account/dashboard",    label: "Home",       icon: (a) => <IconHome active={a} /> },
  { href: "/account/engagements",  label: "Engagements",icon: (a) => <IconReferral active={a} /> },
  { href: "/account/invoices",     label: "Invoices",   icon: (a) => <IconInvoice active={a} /> },
];

function getTabsForRole(role: string): NavTab[] {
  if (role === "ADMIN") return ADMIN_TABS;
  if (role === "REP")   return REP_TABS;
  return ACCOUNT_TABS;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MobileBottomNav({ role }: { role: string }) {
  const pathname = usePathname();
  const tabs = getTabsForRole(role);

  const handleAction = (action: string) => {
    if (action === "menu") {
      // Fire a custom event the Sidebar listens to for opening
      window.dispatchEvent(new CustomEvent("aegis:open-sidebar"));
    }
  };

  return (
    <nav
      className="nyx-bottom-nav"
      aria-label="Mobile navigation"
    >
      {tabs.map((tab) => {
        const isActive = tab.href
          ? pathname === tab.href || pathname.startsWith(tab.href + "/")
          : false;

        const content = (
          <>
            <span className="nyx-bottom-nav-icon">
              {tab.icon(isActive)}
            </span>
            <span
              className="nyx-bottom-nav-label"
              style={{ color: isActive ? "var(--nyx-accent)" : "var(--nyx-text-muted)" }}
            >
              {tab.label}
            </span>
            {isActive && <span className="nyx-bottom-nav-dot" />}
          </>
        );

        if (tab.href) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="nyx-bottom-nav-item"
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={tab.label}
            className="nyx-bottom-nav-item"
            onClick={() => tab.action && handleAction(tab.action)}
            aria-label={tab.label}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
