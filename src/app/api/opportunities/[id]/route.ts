import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  // Whitelist updatable fields
  const data: Record<string, unknown> = {};
  const allowed = ["title","description","stage","serviceLine","value","notes","nextFollowUp","closeDate","assignedRepId","hospitalId","priority","lostReason","source"];
  for (const k of allowed) {
    if (k in body) data[k] = body[k] === "" ? null : body[k];
  }
  if (data.nextFollowUp) data.nextFollowUp = new Date(data.nextFollowUp as string);
  if (data.closeDate) data.closeDate = new Date(data.closeDate as string);
  const opp = await prisma.opportunity.update({
    where: { id },
    data,
    include: {
      hospital: { select: { hospitalName: true } },
      assignedRep: { include: { user: { select: { name: true } } } },
    },
  });
  return NextResponse.json(opp);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.opportunity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
