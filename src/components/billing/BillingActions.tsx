"use client";

import { useState } from "react";

async function post(path: string, body?: unknown): Promise<string> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong");
  return data.url as string;
}

export function SubscribeButton({ tier, label, configured }: { tier: string; label: string; configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span style={{ display: "inline-block" }}>
      <button
        disabled={busy || !configured}
        onClick={async () => {
          setBusy(true); setError(null);
          try { window.location.href = await post("/api/billing/checkout", { tier }); }
          catch (e) { setError(e instanceof Error ? e.message : "Checkout failed"); setBusy(false); }
        }}
        style={{ background: "#c9a84c", color: "#0a0e14", border: "none", padding: "10px 22px", borderRadius: 8, fontWeight: 800, fontSize: "0.85rem", cursor: busy || !configured ? "default" : "pointer", opacity: busy || !configured ? 0.55 : 1 }}
      >
        {busy ? "Opening checkout..." : label}
      </button>
      {error && <span style={{ display: "block", marginTop: 8, color: "#f87171", fontSize: "0.8rem" }}>{error}</span>}
    </span>
  );
}

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span style={{ display: "inline-block" }}>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true); setError(null);
          try { window.location.href = await post("/api/billing/portal"); }
          catch (e) { setError(e instanceof Error ? e.message : "Could not open the billing portal"); setBusy(false); }
        }}
        style={{ background: "transparent", color: "var(--nyx-accent)", border: "1px solid var(--nyx-accent)", padding: "10px 22px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: busy ? "default" : "pointer", opacity: busy ? 0.55 : 1 }}
      >
        {busy ? "Opening..." : "Manage billing"}
      </button>
      {error && <span style={{ display: "block", marginTop: 8, color: "#f87171", fontSize: "0.8rem" }}>{error}</span>}
    </span>
  );
}
