import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

// Territory assignments (RepTerritory rows) for one rep. The rep profile
// PATCH route only saves the free-text Rep.territory description and the
// licensed states list; the rows managed here are what the admin Territory
// Management page and the rep My Territory page actually read. Until now
// nothing outside the seed could create them.

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rep = await prisma.rep.findUnique({ where: { id }, select: { id: true } });
  if (!rep) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const territories = await prisma.repTerritory.findMany({
    where: { repId: id },
    orderBy: [{ state: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(territories);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rep = await prisma.rep.findUnique({ where: { id }, select: { id: true } });
  if (!rep) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { state, city, region, notes } = body as { state?: unknown; city?: unknown; region?: unknown; notes?: unknown };
  const clean = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

  const stateCode = typeof state === "string" ? state.trim().toUpperCase() : "";
  if (!US_STATES.includes(stateCode)) return NextResponse.json({ error: "A valid US state is required" }, { status: 400 });

  const cityValue = clean(city);
  const regionValue = clean(region);
  const existing = await prisma.repTerritory.findFirst({
    where: { repId: id, state: stateCode, city: cityValue ?? null, region: regionValue ?? null },
  });
  if (existing) return NextResponse.json({ error: "That territory is already assigned to this rep" }, { status: 409 });

  const territory = await prisma.repTerritory.create({
    data: { repId: id, state: stateCode, city: cityValue, region: regionValue, notes: clean(notes) },
  });
  return NextResponse.json(territory, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const territoryId = new URL(req.url).searchParams.get("territoryId");
  if (!territoryId) return NextResponse.json({ error: "territoryId required" }, { status: 400 });
  const territory = await prisma.repTerritory.findUnique({ where: { id: territoryId } });
  if (!territory || territory.repId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.repTerritory.delete({ where: { id: territoryId } });
  return NextResponse.json({ ok: true });
}
