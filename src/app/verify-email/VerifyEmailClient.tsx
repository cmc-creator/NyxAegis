"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

const GOLD_BTN: React.CSSProperties = {
  display: "inline-block",
  background: "#c9a84c",
  color: "#1a1208",
  padding: "10px 22px",
  borderRadius: 7,
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.3px",
  border: "none",
  cursor: "pointer",
};

const GHOST_BTN: React.CSSProperties = {
  display: "inline-block",
  background: "transparent",
  color: "#ede4cf",
  padding: "10px 22px",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 13,
  border: "1px solid rgba(201,168,76,0.4)",
  cursor: "pointer",
};

export function ResendButton() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/resend-verification", { method: "POST" });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p style={{ color: "#c9a84c", fontSize: 14, margin: 0 }}>
        Verification email sent. Check your inbox.
      </p>
    );
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <button type="button" onClick={resend} disabled={state === "sending"} style={GOLD_BTN}>
        {state === "sending" ? "Sending..." : "Resend verification email"}
      </button>
      {state === "error" && (
        <span style={{ color: "#f87171", fontSize: 13 }}>
          Something went wrong. Please try again in a few minutes.
        </span>
      )}
    </span>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={GHOST_BTN}
    >
      Sign out
    </button>
  );
}
