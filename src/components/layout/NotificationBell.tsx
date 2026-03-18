"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NotificationBellProps {
  role: string;
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications/unread");
        if (res.ok) {
          const data = await res.json() as { count: number };
          setCount(data.count ?? 0);
        }
      } catch { /* ignore */ }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const href =
    role === "ADMIN" ? "/admin/notifications" :
    role === "REP"   ? "/rep/notifications"   :
                       "/account/notifications";

  const CYAN = "var(--nyx-accent)";

  return (
    <Link
      href={href}
      title={count > 0 ? `${count} unread notification${count > 1 ? "s" : ""}` : "Notifications"}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 8,
        flexShrink: 0,
        textDecoration: "none",
        color: count > 0 ? CYAN : "var(--nyx-text-muted)",
        background: count > 0 ? "var(--nyx-accent-dim)" : "transparent",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {/* Bell icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Unread badge */}
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            minWidth: 10,
            height: 10,
            background: "#ef4444",
            borderRadius: 6,
            fontSize: "0.5rem",
            fontWeight: 800,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            padding: count > 9 ? "0 2px" : "",
          }}
        >
          {count > 99 ? "99+" : count > 9 ? count : ""}
        </span>
      )}
    </Link>
  );
}
