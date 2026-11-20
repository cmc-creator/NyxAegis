import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appBaseUrl, billingConfigured, getStripe, getWorkspaceOrg } from "@/lib/billing";

// POST /api/billing/portal — open the Stripe billing portal for this workspace.
export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!billingConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const org = await getWorkspaceOrg();
  if (!org.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription yet. Choose a plan first." }, { status: 400 });
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${appBaseUrl()}/admin/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
