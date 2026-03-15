import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BASE_SYSTEM_PROMPT = `You are Aegis — the intelligent AI copilot built into NyxAegis, a high-performance business development CRM and referral tracking platform.

## Your Role
You are a proactive, intuitive assistant with LIVE access to the user's CRM data (provided below as "Live Data Context"). You:
- **Answer questions using real data** — always reference actual numbers, names, and statuses from the live context when relevant
- **Proactively suggest next-best-actions** based on pipeline state and data patterns (e.g., stalled deals → follow-up, cold accounts → outreach)
- **Identify gaps and risks** — flag accounts with no recent activity, deals stuck in a stage, goals not on track
- **Identify new referral source opportunities** based on location, specialty, or service line
- **Think like a BD strategist** — connect dots between pipeline gaps, territory gaps, and referral patterns

## Platform Features You Know
- **Pipeline**: Opportunities flow through Discovery → Qualification → Demo → Proposal → Negotiation → Closed Won/Lost
- **Referral Tracking**: Track referral sources (accounts/clients), referrals received, volumes, and relationship health
- **Leads**: New potential accounts/referral sources before they enter the pipeline
- **Accounts (Clients)**: The organizations that send referrals; managed per-territory
- **BD Reps**: Field reps assigned to territories, tracked for activity, pipeline contribution, and compliance
- **Communications Hub**: Send emails via Outlook/Gmail, Teams messages, and internal notes
- **Calendar Sync**: Google Calendar or Outlook Calendar auto-sync
- **Territory Map**: Geographic view of accounts and rep coverage areas
- **Compliance Center**: Track training, licenses, and document verification
- **Contracts & Invoices**: Manage agreements and billing tied to accounts
- **Analytics & Reports**: Pipeline performance, activity trends, revenue attribution

## Proactive Behavior
- If pipeline data shows deals stalled → surface them and suggest action
- If there are leads with no follow-up → flag and offer outreach draft
- If the user asks "how am I doing" or "what should I focus on" → answer using THEIR actual data
- If the user asks about specific accounts, reps, or opportunities → look them up in the live context and answer precisely

## Tone & Format
- Professional, smart, warm, and direct. Like a senior BD strategist who knows the platform and the user's actual data cold.
- Use **bold** for key terms and names, bullet lists for options/steps, and short paragraphs.
- Cite actual numbers from the live data — never say "I don't have access to your data."
- Offer concrete next steps grounded in what the data actually shows.

You are NOT a general-purpose assistant. Stay focused on business development, referral management, CRM strategy, and platform navigation.`;

// ── Live data fetcher ────────────────────────────────────────────────────────
async function buildLiveContext(userId: string, role: string): Promise<string> {
  try {
    if (role === "ADMIN") {
      const [
        opportunitiesByStage,
        leadsByStatus,
        recentActivities,
        referralSources,
        reps,
        accounts,
        referralsThisMonth,
      ] = await Promise.all([
        prisma.opportunity.groupBy({ by: ["stage"], _count: { id: true }, _sum: { value: true } }),
        prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.activity.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { rep: { include: { user: { select: { name: true } } } }, hospital: { select: { hospitalName: true } } },
        }),
        prisma.referralSource.findMany({
          take: 15,
          where: { active: true },
          include: { _count: { select: { referrals: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.rep.findMany({
          include: {
            user: { select: { name: true, email: true } },
            _count: { select: { opportunities: true, activities: true, leads: true } },
          },
        }),
        prisma.hospital.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.referral.count({
          where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        }),
      ]);

      const totalPipelineValue = opportunitiesByStage.reduce((sum, s) => sum + Number(s._sum.value ?? 0), 0);

      return `
## LIVE CRM DATA (as of ${new Date().toLocaleDateString()})

### Pipeline Summary
${opportunitiesByStage.map(s => `- **${s.stage}**: ${s._count.id} deals, $${Number(s._sum.value ?? 0).toLocaleString()} value`).join("\n")}
- **Total pipeline value**: $${totalPipelineValue.toLocaleString()}

### Leads by Status
${leadsByStatus.map(l => `- **${l.status}**: ${l._count.id}`).join("\n")}

### Accounts (Hospitals) by Status
${accounts.map(a => `- **${a.status}**: ${a._count.id}`).join("\n")}

### Referrals This Month: ${referralsThisMonth}

### Active Referral Sources (sample)
${referralSources.slice(0, 10).map(rs => `- **${rs.name}** (${rs.type}${rs.city ? ", " + rs.city : ""}${rs.state ? " " + rs.state : ""}) — ${rs._count.referrals} referrals`).join("\n")}

### BD Reps (${reps.length} total)
${reps.map(r => `- **${r.user.name ?? r.user.email}** — ${r.title ?? "Rep"}, ${r.territory ?? "no territory"} | ${r._count.opportunities} opps, ${r._count.activities} activities, ${r._count.leads} leads`).join("\n")}

### Recent Activities (last 10)
${recentActivities.map(a => `- [${a.type}] ${a.title}${a.rep ? " by " + (a.rep.user.name ?? "Rep") : ""}${a.hospital ? " @ " + a.hospital.hospitalName : ""} (${new Date(a.createdAt).toLocaleDateString()})`).join("\n")}
`;
    }

    if (role === "REP") {
      const rep = await prisma.rep.findUnique({
        where: { userId },
        include: { user: { select: { name: true } }, territories: true },
      });
      if (!rep) return "\n## LIVE DATA\nNo rep profile found for this user.\n";

      const [myOpps, myLeads, myActivities, myReferralSources] = await Promise.all([
        prisma.opportunity.findMany({
          where: { assignedRepId: rep.id },
          include: { hospital: { select: { hospitalName: true } } },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.lead.findMany({
          where: { assignedRepId: rep.id },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
        prisma.activity.findMany({
          where: { repId: rep.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { hospital: { select: { hospitalName: true } } },
        }),
        prisma.referralSource.findMany({
          where: { assignedRepId: rep.id, active: true },
          include: { _count: { select: { referrals: true } } },
        }),
      ]);

      const oppsByStage = myOpps.reduce((acc, o) => {
        acc[o.stage] = (acc[o.stage] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const totalValue = myOpps.reduce((s, o) => s + Number(o.value ?? 0), 0);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const coldAccounts = myOpps.filter(o => new Date(o.updatedAt) < thirtyDaysAgo && !["CLOSED_WON","CLOSED_LOST"].includes(o.stage));

      return `
## LIVE CRM DATA for ${rep.user.name ?? "Rep"} (as of ${new Date().toLocaleDateString()})
**Territory**: ${rep.territory ?? rep.territories.map(t => t.state).join(", ") || "not set"}
**Title**: ${rep.title ?? "BD Rep"}

### My Pipeline (${myOpps.length} opportunities, $${totalValue.toLocaleString()} total value)
${Object.entries(oppsByStage).map(([stage, count]) => `- **${stage}**: ${count}`).join("\n")}

${coldAccounts.length > 0 ? `### ⚠️ Deals with No Activity in 30+ Days (${coldAccounts.length})
${coldAccounts.map(o => `- **${o.title}** @ ${o.hospital.hospitalName} (stage: ${o.stage}, last updated ${new Date(o.updatedAt).toLocaleDateString()})`).join("\n")}
` : ""}
### My Leads (${myLeads.length} total)
${myLeads.slice(0, 10).map(l => `- **${l.hospitalName}** — ${l.status}${l.city ? ", " + l.city : ""}${l.state ? " " + l.state : ""}${l.nextFollowUp ? " | Follow-up: " + new Date(l.nextFollowUp).toLocaleDateString() : ""}`).join("\n")}

### My Referral Sources (${myReferralSources.length} active)
${myReferralSources.map(rs => `- **${rs.name}** (${rs.type}) — ${rs._count.referrals} referrals${rs.city ? ", " + rs.city : ""}`).join("\n")}

### Recent Activities (last 10)
${myActivities.map(a => `- [${a.type}] ${a.title}${a.hospital ? " @ " + a.hospital.hospitalName : ""} (${new Date(a.createdAt).toLocaleDateString()})`).join("\n")}
`;
    }

    if (role === "ACCOUNT") {
      const hospital = await prisma.hospital.findUnique({
        where: { userId },
        include: {
          invoices: { orderBy: { createdAt: "desc" }, take: 5 },
          opportunities: { orderBy: { updatedAt: "desc" }, take: 5 },
        },
      });
      if (!hospital) return "\n## LIVE DATA\nNo account profile found.\n";
      return `
## LIVE CRM DATA for ${hospital.hospitalName} (as of ${new Date().toLocaleDateString()})
**Status**: ${hospital.status}
**Type**: ${hospital.hospitalType}
**Location**: ${[hospital.city, hospital.state].filter(Boolean).join(", ")}

### Recent Invoices
${hospital.invoices.map(i => `- Invoice #${i.invoiceNumber} — $${Number(i.totalAmount).toLocaleString()} — **${i.status}**${i.dueDate ? " (due " + new Date(i.dueDate).toLocaleDateString() + ")" : ""}`).join("\n") || "None"}

### Active Opportunities
${hospital.opportunities.map(o => `- **${o.title}** — stage: ${o.stage}`).join("\n") || "None"}
`;
    }
  } catch (err) {
    console.error("Live context fetch error:", err);
  }
  return "";
}

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

  // Fetch live data from the database for this user
  const liveContext = await buildLiveContext(session.user.id, session.user.role);
  const systemPrompt = BASE_SYSTEM_PROMPT + (liveContext ? `\n${liveContext}` : "");

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
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
