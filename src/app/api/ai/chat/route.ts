import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SYSTEM_PROMPT = `You are Aegis — the intelligent AI assistant built into NyxAegis, a referral tracking and relationship CRM platform.

You help team members, managers, and administrators with:
- Tracking and managing referral sources, leads, and opportunities
- Understanding pipeline stages (Discovery → Qualification → Demo → Proposal → Negotiation → Closed Won/Lost)
- Drafting outreach messages, follow-up notes, emails, and proposals
- Analyzing territory performance and recommending next-best-action
- Reviewing activity logs and surfacing relationships at risk of going cold
- Navigating the platform (e.g. "Where do I add a new lead?" or "How do I log a visit?")
- Compliance and contract questions in a relationship management context
- Best practices for building and maintaining high-value referral partnerships

Tone: professional, concise, and smart. Keep answers focused and actionable. When you don't have access to specific account data (you don't have live DB access), offer to help draft content, explain platform features, or suggest next steps instead.

You are NOT a general-purpose assistant — stay focused on referral tracking, relationship management, and CRM topics. Politely redirect unrelated requests.`;

export async function POST(req: NextRequest) {
  let session;
  try { session = await auth(); } catch { /* ignore */ }
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = await req.json() as { messages: { role: string; content: string }[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      role: "assistant",
      content: "⚠️ The AI assistant isn't configured yet. Please add your **OPENAI_API_KEY** to your Vercel environment variables and redeploy.",
    });
  }

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 1024,
    temperature: 0.7,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "AI service error — please try again." }, { status: 502 });
  }

  const data = await res.json() as {
    choices: { message: { role: string; content: string } }[];
  };

  const reply = data.choices?.[0]?.message;
  if (!reply) return NextResponse.json({ error: "No response from AI" }, { status: 502 });

  return NextResponse.json(reply);
}
