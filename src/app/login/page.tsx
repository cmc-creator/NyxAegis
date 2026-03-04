"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CYAN = "#00d4ff";
const BG = "#04080f";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* LEFT PANEL */}
      <div style={{ flex: "0 0 45%", background: "rgba(0,212,255,0.03)", borderRight: "1px solid rgba(0,212,255,0.08)", padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 64 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#04080f"/>
              <rect x="1" y="1" width="30" height="30" rx="7" stroke={CYAN} strokeWidth="1" strokeOpacity="0.4"/>
              <path d="M16 6 L26 12 L26 20 L16 26 L6 20 L6 12 Z" stroke={CYAN} strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
              <circle cx="16" cy="16" r="4" fill={CYAN} fillOpacity="0.8"/>
            </svg>
            <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "#d8e8f4" }}>NyxAegis</span>
          </div>
          <div className="login-fade-up">
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#d8e8f4", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.02em" }}>
              Hospital BD<br />
              <span className="login-text-glow" style={{ color: CYAN }}>Command Center</span>
            </h1>
            <p style={{ color: "rgba(216,232,244,0.55)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 320, marginBottom: 40 }}>
              Manage hospital accounts, track your opportunity pipeline, and grow your healthcare BD business — all from one platform.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: "🏥", text: "360° hospital account management" },
                { icon: "📊", text: "Live opportunity pipeline tracking" },
                { icon: "🗺️", text: "Geographic territory management" },
                { icon: "📋", text: "HIPAA compliance document storage" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.9rem", color: "rgba(216,232,244,0.7)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["HIPAA Ready", "SOC 2", "Healthcare BD"].map((badge) => (
            <div key={badge} style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 6, padding: "6px 12px", fontSize: "0.7rem", color: CYAN, fontWeight: 600, letterSpacing: "0.08em" }}>{badge}</div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div className="login-slide-in" style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d8e8f4", marginBottom: 8, letterSpacing: "-0.02em" }}>Welcome back</h2>
          <p style={{ color: "rgba(216,232,244,0.5)", marginBottom: 32, fontSize: "0.9rem" }}>Sign in to your NyxAegis account</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: "0.875rem", color: "#f87171" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "rgba(0,212,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@hospital.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 8, padding: "12px 16px", color: "#d8e8f4", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "rgba(0,212,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 8, padding: "12px 16px", color: "#d8e8f4", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? "rgba(0,212,255,0.4)" : CYAN, color: BG, padding: "13px", borderRadius: 8, fontWeight: 800, fontSize: "0.95rem", border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.85rem", color: "rgba(216,232,244,0.45)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>Request Access</Link>
          </div>

          <div style={{ marginTop: 40, padding: "16px", background: "rgba(0,212,255,0.03)", borderRadius: 8, border: "1px solid rgba(0,212,255,0.06)" }}>
            <p style={{ fontSize: "0.7rem", color: "rgba(216,232,244,0.35)", textAlign: "center", marginBottom: 8 }}>DEMO CREDENTIALS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { role: "Admin", email: "admin@nyxaegis.com", pw: "admin123!" },
                { role: "Rep", email: "rep@nyxaegis.com", pw: "rep123!" },
                { role: "Account", email: "contact@nashvillegeneral.com", pw: "account123!" },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: "4px 0" }}
                >
                  <span style={{ fontSize: "0.75rem", color: CYAN, opacity: 0.6, fontWeight: 600 }}>{d.role}:</span>
                  <span style={{ fontSize: "0.75rem", color: "rgba(216,232,244,0.45)", marginLeft: 6 }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.75rem", color: "rgba(216,232,244,0.25)" }}>
            <Link href="/terms" style={{ color: "inherit" }}>Terms</Link> · <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link> · © 2026 NyxCollective LLC
          </p>
        </div>
      </div>
    </div>
  );
}
