import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, tierForPriceId } from "@/lib/billing";

// POST /api/billing/webhook - Stripe subscription lifecycle events.
// Keeps the workspace Organization plan in sync automatically.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function orgForEvent(metadataOrgId: string | undefined, customerId: string | null) {
    if (metadataOrgId) {
      const org = await prisma.organization.findUnique({ where: { id: metadataOrgId } });
      if (org) return org;
    }
    if (customerId) {
      const org = await prisma.organization.findFirst({ where: { stripeCustomerId: customerId } });
      if (org) return org;
    }
    return null;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const org = await orgForEvent(session.metadata?.organizationId, typeof session.customer === "string" ? session.customer : null);
      if (org) {
        const tier = session.metadata?.tier;
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            stripeCustomerId: typeof session.customer === "string" ? session.customer : org.stripeCustomerId,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : org.stripeSubscriptionId,
            subscriptionStatus: "active",
            ...(tier === "starter" || tier === "growth" || tier === "enterprise" ? { planTier: tier } : {}),
          },
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const org = await orgForEvent(sub.metadata?.organizationId, typeof sub.customer === "string" ? sub.customer : null);
      if (org) {
        const priceId = sub.items.data[0]?.price?.id;
        const tier = tierForPriceId(priceId);
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            ...(tier ? { planTier: tier } : {}),
          },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const org = await orgForEvent(sub.metadata?.organizationId, typeof sub.customer === "string" ? sub.customer : null);
      if (org) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { subscriptionStatus: "canceled", stripeSubscriptionId: null, planTier: "starter" },
        });
      }
    }
  } catch (err) {
    console.error("[billing/webhook]", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
