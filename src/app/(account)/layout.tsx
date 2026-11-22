import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEmailVerified } from "@/lib/verification";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import AIChatWidget from "@/components/ai/AIChatWidget";
import SessionTracker from "@/components/analytics/SessionTracker";
import FirstLoginCelebration from "@/components/onboarding/FirstLoginCelebration";
import OnboardingWalkthrough from "@/components/onboarding/OnboardingWalkthrough";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  let session;
  try { session = await auth(); } catch { redirect("/login"); }
  if (!session || (session.user.role !== "ACCOUNT" && session.user.role !== "ADMIN")) redirect("/login");

  // Email verification gate: self-serve accounts must verify their email
  // before using the portal. Admins are exempt, and accounts created
  // before the gate launched are grandfathered (see lib/verification).
  if (session.user.role !== "ADMIN") {
    let verified = true;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true, createdAt: true, role: true },
      });
      verified = dbUser ? isEmailVerified(dbUser) : false;
    } catch {
      verified = true; // fail open on lookup errors; the middleware gate still applies
    }
    if (!verified) redirect("/verify-email");
  }

  return (
    <div className="flex min-h-screen" style={{ color: "var(--nyx-text)" }}>
      <MobileTopBar role="ACCOUNT" userName={session.user.name ?? ""} />
      <Sidebar role="ACCOUNT" userName={session.user.name} userEmail={session.user.email} />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto" style={{ background: "var(--nyx-bg-scrim, var(--nyx-bg))" }}>
        <div className="px-4 pt-0 pb-6 md:p-8 page-enter">{children}</div>
      </main>
      <AIChatWidget />
      <FirstLoginCelebration role="ACCOUNT" userName={session.user.name} userEmail={session.user.email} />
      <OnboardingWalkthrough role="ACCOUNT" />
      <SessionTracker />
      <MobileBottomNav role="ACCOUNT" />
    </div>
  );
}
