import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, billingConfigured, getStripe, getWorkspaceOrg, isTierKey, priceIdForTier, TIERS } from "@/lib/billing";

// POST /api/billing/checkout — start a subscription checkout for a plan tier.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!billingConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const { tier } = (await req.json().catch(() => ({}))) as { tier?: string };
  if (!tier || !isTierKey(tier)) {
    return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
  }
  const priceId = priceIdForTier(tier);
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for the ${TIERS[tier].name} plan.` }, { status: 503 });
  }

  const stripe = getStripe();
  const org = await getWorkspaceOrg();

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: org.name,
      metadata: { organizationId: org.id },
    });
    customerId = customer.id;
    await prisma.organization.update({ where: { id: org.id }, data: { stripeCustomerId: customerId } });
  }

  const base = appBaseUrl();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    allow_promotion_codes: true,
    payment_method_collection: "if_required",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/admin/billing?checkout=success`,
    cancel_url: `${base}/admin/billing?checkout=cancelled`,
    metadata: { organizationId: org.id, tier },
    subscription_data: { metadata: { organizationId: org.id, tier } },
  });

  return NextResponse.json({ url: checkout.url });
}
