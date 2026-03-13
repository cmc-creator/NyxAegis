import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const source = await prisma.referralSource.findUnique({
    where: { id: params.id },
    include: {
      assignedRep: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { referrals: true } },
    },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(source);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, type, specialty, practiceName, npi,
    contactName, email, phone,
    address, city, state, zip,
    assignedRepId, monthlyGoal, visitFrequencyDays, notes, active,
  } = body;

  const source = await prisma.referralSource.update({
    where: { id: params.id },
    data: {
      ...(name              !== undefined ? { name }              : {}),
      ...(type              !== undefined ? { type }              : {}),
      ...(specialty         !== undefined ? { specialty }         : {}),
      ...(practiceName      !== undefined ? { practiceName }      : {}),
      ...(npi               !== undefined ? { npi }               : {}),
      ...(contactName       !== undefined ? { contactName }       : {}),
      ...(email             !== undefined ? { email }             : {}),
      ...(phone             !== undefined ? { phone }             : {}),
      ...(address           !== undefined ? { address }           : {}),
      ...(city              !== undefined ? { city }              : {}),
      ...(state             !== undefined ? { state }             : {}),
      ...(zip               !== undefined ? { zip }               : {}),
      ...(assignedRepId     !== undefined ? { assignedRepId: assignedRepId || null } : {}),
      ...(monthlyGoal       !== undefined ? { monthlyGoal: monthlyGoal ? Number(monthlyGoal) : null } : {}),
      ...(visitFrequencyDays !== undefined ? { visitFrequencyDays: visitFrequencyDays ? Number(visitFrequencyDays) : null } : {}),
      ...(notes             !== undefined ? { notes }             : {}),
      ...(active            !== undefined ? { active }            : {}),
    },
  });
  return NextResponse.json(source);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.referralSource.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
