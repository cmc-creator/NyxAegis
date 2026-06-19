import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

interface OverdueHospital {
  id: string;
  hospitalName: string;
  city?: string | null;
  state?: string | null;
  status: string;
  daysSinceActivity: number | null;
  contacts: Array<{ name: string; title?: string | null }>;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "REP" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const body = await req.json() as { hospitals: OverdueHospital[] };
  const hospitals: OverdueHospital[] = body.hospitals ?? [];

  if (!hospitals.length) {
    return NextResponse.json({ suggestions: "No overdue locations provided." });
  }

  const hospitalList = hospitals
    .slice(0, 20)
    .map((h, i) => {
      const location = [h.city, h.state].filter(Boolean).join(", ");
      const lastContact =
        h.daysSinceActivity != null
          ? `last contacted ${h.daysSinceActivity} days ago`
          : "never contacted";
      const contactList = h.contacts.length
        ? h.contacts.map(c => `${c.name}${c.title ? ` (${c.title})` : ""}`).join(", ")
        : "no contacts on file";
      return `${i + 1}. **${h.hospitalName}**${location ? ` — ${location}` : ""} | Status: ${h.status} | ${lastContact} | Contacts: ${contactList}`;
    })
    .join("\n");

  const prompt = `You are Aegis, a senior BD strategist for a healthcare services company. A rep has ${hospitals.length} account(s) in their territory that have gone 30+ days without contact.

For each account below, give a specific, actionable recommendation:
- If no contacts exist: suggest the exact role/title to target (e.g., CNO, VP of Supply Chain) and a specific cold outreach angle relevant to healthcare services
- If contacts exist: suggest which contact to prioritize and a concrete re-engagement hook tied to their title
- Flag PROSPECT accounts as priority new business opportunities and suggest a compelling first-touch approach
- Keep each recommendation to 2-3 sentences. Be direct and practical.

Overdue Accounts:
${hospitalList}`;

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.65 },
    }),
  });

  if (!res.ok) {
    console.error("Gemini suggestions error:", await res.text());
    return NextResponse.json({ error: "AI service error. Please try again." }, { status: 502 });
  }

  const data = await res.json() as {
    candidates?: { content: { parts: { text: string }[] } }[];
  };
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No suggestions generated.";

  return NextResponse.json({ suggestions: text });
}
