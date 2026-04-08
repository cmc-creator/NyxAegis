"use client";
import { Suspense, useState, type FormEvent } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function getRoleHome(role?: string) {
  switch (role) {
    case "ADMIN":   return "/admin/dashboard";
    case "REP":     return "/rep/dashboard";
    case "ACCOUNT": return "/account/dashboard";
    default:        return "/admin/dashboard";
  }
}

const CYAN = "var(--nyx-accent)";
const BG = "var(--nyx-bg)";
const TEXT = "var(--nyx-text)";
const MUTED = "var(--nyx-text-muted)";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        // Get role from session to redirect to the correct portal
        const session = await getSession();
        const callbackUrl = searchParams.get("callbackUrl");
        const destination = callbackUrl ?? getRoleHome(session?.user?.role as string | undefined);
        router.push(destination);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 28%, transparent 72%, rgba(201,168,76,0.06) 100%)" }} />
        <div style={{ position: "absolute", top: -140, left: -120, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 65%)", filter: "blur(24px)" }} />
        <div style={{ position: "absolute", bottom: -160, right: -80, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 62%)", filter: "blur(30px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px", opacity: 0.18 }} />
      </div>

      {/* LEFT PANEL */}
      <div className="nyx-login-left" style={{ flex: "0 0 49%", padding: "72px 60px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", borderRight: "1px solid rgba(201,168,76,0.14)", background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(201,168,76,0.08) 20%, rgba(10,8,6,0.3) 48%, rgba(8,5,2,0.88) 100%)", boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04)" }}>
        <div style={{ position: "absolute", inset: 24, border: "1px solid rgba(201,168,76,0.1)", borderRadius: 30, pointerEvents: "none" }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 72 }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(201,168,76,0.08))", border: "1px solid rgba(201,168,76,0.22)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
              <Image src="/Aegislogo.png" alt="NyxAegis" width={34} height={34} style={{ objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", letterSpacing: "0.24em", color: "rgba(237,228,207,0.55)", textTransform: "uppercase", marginBottom: 4 }}>Private Access</div>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: TEXT }}>NyxAegis</span>
            </div>
          </div>
          <div className="login-fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", marginBottom: 26, borderRadius: 999, border: "1px solid rgba(201,168,76,0.22)", background: "rgba(201,168,76,0.06)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: CYAN, boxShadow: "0 0 12px var(--nyx-accent-glow)" }} />
              <span style={{ fontSize: "0.7rem", color: CYAN, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Luxury Workflow Platform</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "3.5rem", fontWeight: 700, color: TEXT, lineHeight: 0.96, marginBottom: 18, letterSpacing: "0.01em" }}>
              Elegant control
              <br />
              <span className="login-text-glow" style={{ color: CYAN }}>for serious growth.</span>
            </h1>
            <p style={{ color: "rgba(237,228,207,0.72)", fontSize: "1rem", lineHeight: 1.82, maxWidth: 450, marginBottom: 44 }}>
              A refined command center for teams that need pristine visibility, polished execution, and a platform that feels as premium as the business it supports.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 520 }}>
              {[
                { eyebrow: "Visibility", text: "Live pipeline and account intelligence" },
                { eyebrow: "Precision", text: "Territory and engagement control" },
                { eyebrow: "Security", text: "Protected credentials and governed access" },
                { eyebrow: "Signal", text: "A focused workspace with zero clutter" },
              ].map((item) => (
                <div key={item.text} style={{ padding: "16px 18px", borderRadius: 18, border: "1px solid rgba(201,168,76,0.12)", background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.68rem", color: CYAN, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{item.eyebrow}</div>
                  <span style={{ fontSize: "0.92rem", color: "rgba(237,228,207,0.78)", lineHeight: 1.55 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["Private Admin Access", "Polished CRM Ops", "NyxAegis Secure"].map((badge) => (
            <div key={badge} style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.16)", borderRadius: 999, padding: "8px 14px", fontSize: "0.68rem", color: "rgba(237,228,207,0.78)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{badge}</div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", position: "relative", zIndex: 1 }}>
        <div className="login-slide-in gold-card" style={{ width: "100%", maxWidth: 460, padding: "34px 34px 28px", borderRadius: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015)), var(--nyx-card)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: CYAN, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>Secure Sign In</div>
              <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "2.2rem", fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: "0.01em", lineHeight: 0.98 }}>Welcome back</h2>
              <p style={{ color: MUTED, marginBottom: 0, fontSize: "0.95rem", lineHeight: 1.65 }}>Enter your credentials to access the NyxAegis command environment.</p>
            </div>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(201,168,76,0.08))", border: "1px solid rgba(201,168,76,0.22)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}>
              <Image src="/Aegislogo.png" alt="NyxAegis" width={34} height={34} style={{ objectFit: "contain" }} />
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(127,29,29,0.28)", border: "1px solid rgba(248,113,113,0.22)", borderRadius: 14, padding: "13px 16px", marginBottom: 20, fontSize: "0.9rem", color: "#fca5a5", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--nyx-accent-label)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@nyxaegis.com"
                style={{ width: "100%", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))", border: "1px solid rgba(201,168,76,0.16)", borderRadius: 16, padding: "15px 16px", color: TEXT, fontSize: "0.95rem", outline: "none", boxSizing: "border-box", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--nyx-accent-label)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: "100%", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))", border: "1px solid rgba(201,168,76,0.16)", borderRadius: 16, padding: "15px 16px", color: TEXT, fontSize: "0.95rem", outline: "none", boxSizing: "border-box", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: -2 }}>
              <span style={{ fontSize: "0.76rem", color: "rgba(237,228,207,0.48)" }}>Protected access for authorized users only.</span>
              <Link href="/privacy" style={{ fontSize: "0.78rem", color: CYAN, textDecoration: "none", fontWeight: 700 }}>Privacy</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? "var(--nyx-accent-label)" : "linear-gradient(180deg, #f0d060 0%, var(--nyx-accent) 100%)", color: "#1a0e00", padding: "15px", borderRadius: 16, fontWeight: 900, fontSize: "0.96rem", border: "1px solid rgba(201,168,76,0.25)", cursor: loading ? "not-allowed" : "pointer", marginTop: 6, boxShadow: loading ? "none" : "0 16px 34px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,255,255,0.28)" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 26, textAlign: "center", fontSize: "0.86rem", color: "rgba(237,228,207,0.5)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>Request Access</Link>
          </div>

          <div style={{ marginTop: 28, padding: "16px 18px", background: "linear-gradient(180deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))", borderRadius: 16, border: "1px solid rgba(201,168,76,0.14)" }}>
            <p style={{ fontSize: "0.74rem", color: "rgba(237,228,207,0.52)", textAlign: "center", lineHeight: 1.6, margin: 0 }}>Access is provisioned by your workspace administrator. If you need help, contact support through your onboarding channel.</p>
          </div>

          <p style={{ marginTop: 22, textAlign: "center", fontSize: "0.75rem", color: "rgba(237,228,207,0.32)" }}>
            <Link href="/terms" style={{ color: "inherit" }}>Terms</Link> · <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link> · © 2026 NyxAegis
          </p>
        </div>
      </div>
    </div>
  );
}
