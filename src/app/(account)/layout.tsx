import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import AIChatWidget from "@/components/ai/AIChatWidget";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  let session;
  try { session = await auth(); } catch { redirect("/login"); }
  if (!session || (session.user.role !== "ACCOUNT" && session.user.role !== "ADMIN")) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ color: "var(--nyx-text)" }}>
      <MobileTopBar role="ACCOUNT" userName={session.user.name ?? ""} />
      <Sidebar role="ACCOUNT" userName={session.user.name} userEmail={session.user.email} />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto" style={{ background: "var(--nyx-bg-scrim, var(--nyx-bg))" }}>
        <div className="px-4 pt-0 pb-6 md:p-8 page-enter">{children}</div>
      </main>
      <AIChatWidget />
      <MobileBottomNav role="ACCOUNT" />
    </div>
  );
}
