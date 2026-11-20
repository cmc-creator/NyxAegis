import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export type TierKey = "starter" | "growth" | "enterprise";

export const TIERS: Record<TierKey, { name: string; monthly: number; seats: number | null; priceEnv: string; blurb: string }> = {
  starter:    { name: "Starter",    monthly: 149, seats: 3,    priceEnv: "STRIPE_PRICE_STARTER",    blurb: "For a small business development team getting started." },
  growth:     { name: "Growth",     monthly: 399, seats: 10,   priceEnv: "STRIPE_PRICE_GROWTH",     blurb: "For a growing team covering a full territory." },
  enterprise: { name: "Enterprise", monthly: 999, seats: null, priceEnv: "STRIPE_PRICE_ENTERPRISE", blurb: "Unlimited reps for multi site health systems." },
};

export function isTierKey(v: string): v is TierKey {
  return v === "starter" || v === "growth" || v === "enterprise";
}

export function priceIdForTier(tier: TierKey): string | null {
  return process.env[TIERS[tier].priceEnv] ?? null;
}

export function tierForPriceId(priceId: string | null | undefined): TierKey | null {
  if (!priceId) return null;
  for (const key of Object.keys(TIERS) as TierKey[]) {
    if (priceIdForTier(key) === priceId) return key;
  }
  return null;
}

export function billingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

// NyxAegis runs as one workspace per deployment, so subscription state lives
// on a single Organization row, created on first use.
export async function getWorkspaceOrg() {
  const existing = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.organization.create({
    data: { name: "NyxAegis Workspace", slug: "workspace" },
  });
}

export function appBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.nyxaegis.com").replace(/\/$/, "");
}
