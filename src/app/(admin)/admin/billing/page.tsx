import { prisma } from "@/lib/prisma";
import { billingConfigured, getWorkspaceOrg, isTierKey, TIERS, type TierKey } from "@/lib/billing";
import { ManageBillingButton, SubscribeButton } from "@/components/billing/BillingActions";

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const params = await searchParams;
  const org = await getWorkspaceOrg();
  const repCount = await prisma.rep.count();
  const configured = billingConfigured();
  const currentTier: TierKey = isTierKey(org.planTier) ? org.planTier : "starter";
  const subscribed = Boolean(org.stripeSubscriptionId) && (org.subscriptionStatus === "active" || org.subscriptionStatus === "trialing");

  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(216,232,244,0.08)", borderRadius: 14, padding: "24px 28px", marginBottom: 20 } as const;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Billing &amp; Subscription</h1>
      <p style={{ color: "rgba(216,232,244,0.5)", marginBottom: 28, fontSize: "0.9rem" }}>
        Plans renew monthly through Stripe. Upgrades, payment methods, and cancellation are self service.
      </p>

      {params.checkout === "success" && (
        <div style={{ ...card, borderColor: "rgba(52,211,153,0.4)" }}>
          <strong>Subscription received.</strong> Your plan updates within a few seconds once Stripe confirms payment.
        </div>
      )}
      {params.checkout === "cancelled" && (
        <div style={card}>Checkout was cancelled. Your plan did not change.</div>
      )}
      {!configured && (
        <div style={card}>
          <strong>Billing setup is almost done.</strong> Plan buttons turn on as soon as the Stripe connection is finished by the NyxCollective team.
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--nyx-accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Current plan
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800 }}>
          {TIERS[currentTier].name} · ${TIERS[currentTier].monthly}/mo
        </h2>
        <p style={{ margin: "0 0 6px", color: "rgba(216,232,244,0.55)", lineHeight: 1.6 }}>
          Status: {subscribed ? `Subscribed (${org.subscriptionStatus})` : "Not subscribed yet"} · Reps: {repCount} of {TIERS[currentTier].seats ?? "unlimited"}
        </p>
        {subscribed && <ManageBillingButton />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
        {(Object.keys(TIERS) as TierKey[]).map((key) => {
          const tier = TIERS[key];
          const isCurrent = key === currentTier;
          return (
            <div key={key} style={{ ...card, marginBottom: 0, borderColor: isCurrent ? "rgba(201,168,76,0.55)" : "rgba(216,232,244,0.08)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--nyx-accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                {tier.name}{isCurrent ? " · current" : ""}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>${tier.monthly}<span style={{ fontSize: "0.85rem", color: "rgba(216,232,244,0.5)" }}>/mo</span></div>
              <p style={{ color: "rgba(216,232,244,0.55)", lineHeight: 1.6, minHeight: 66 }}>
                {tier.blurb}<br />{tier.seats ? `Up to ${tier.seats} reps.` : "Unlimited reps."}
              </p>
              {!isCurrent && (subscribed
                ? <ManageBillingButton />
                : <SubscribeButton tier={key} label={`Subscribe to ${tier.name}`} configured={configured} />)}
              {isCurrent && subscribed && <ManageBillingButton />}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 16, fontSize: "0.75rem", color: "rgba(216,232,244,0.35)" }}>
        Workspace: {org.name}. Questions: info@nyxcollectivellc.com
      </p>
    </div>
  );
}
