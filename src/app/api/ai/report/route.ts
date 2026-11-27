import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/ai/report
// Stores a user report about a piece of AI-generated content
// (Microsoft Store policy 11.16: users must be able to report
// inappropriate AI output). Requires a signed-in session, same
// as /api/ai/chat. Reports land in the ai_content_reports table.
export async function POST(req: NextRequest) {
  let session;
  try { session = await auth(); } catch { /* ignore */ }
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { content?: unknown; prompt?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content : "";
  if (!content.trim()) return NextResponse.json({ error: "No content provided" }, { status: 400 });
  const prompt = typeof body?.prompt === "string" ? body.prompt : null;

  await prisma.aiContentReport.create({
    data: {
      userId: session.user.id,
      userEmail: session.user.email ?? null,
      prompt: prompt ? prompt.slice(0, 10000) : null,
      content: content.slice(0, 10000),
    },
  });

  return NextResponse.json({ ok: true });
}
