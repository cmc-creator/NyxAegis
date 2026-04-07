import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  // Whitelist updatable fields to prevent mass-assignment
  const data: Record<string, unknown> = {};
  const allowed = ["hospitalName","systemName","hospitalType","bedCount","state","city","contactName","contactEmail","contactPhone","contactTitle","serviceInterest","estimatedValue","notes","status","source","priority","nextFollowUp","assignedRepId"];
  for (const k of allowed) {
    if (k in body) data[k] = body[k] === "" ? null : body[k];
  }
  if (data.nextFollowUp) data.nextFollowUp = new Date(data.nextFollowUp as string);
  if (data.bedCount !== undefined && data.bedCount !== null) data.bedCount = Number(data.bedCount);
  const lead = await prisma.lead.update({ where: { id }, data, include: { assignedRep: { include: { user: { select: { name: true } } } } } });
  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
