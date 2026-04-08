import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

const BASE_SYSTEM_PROMPT = `You are Aegis â€” the intelligent AI copilot built into NyxAegis CRM.

## Your Capabilities
You have LIVE access to CRM data through function tools. Use them proactively:
- When a user asks about a specific account, rep, opportunity, or lead â†’ call the relevant lookup tool immediately
- When a user asks "what should I focus on" or "what's overdue" â†’ call get_overdue_items
- When a user wants to log a call/visit/note â†’ call log_activity
- When a user wants to move a deal â†’ call update_deal_stage
- When a user wants to add a prospect â†’ call create_lead
- You remember previous conversations (shown below if any)

## Rules
- ALWAYS use tools to fetch specific data rather than saying you lack access
- Cite real names, numbers, dates from tool results
- After taking an action (log, update, create), confirm what you did concisely
- Be proactive: if tool results show problems (cold deals, missed follow-ups), surface them
- Professional, warm, direct â€” like a senior BD strategist who knows this business cold
- Use **bold** for names and key terms, bullets for lists

## Pipeline Stages
DISCOVERY â†’ QUALIFICATION â†’ DEMO â†’ PROPOSAL â†’ NEGOTIATION â†’ CLOSED_WON / CLOSED_LOST / ON_HOLD

Stay focused on CRM, BD strategy, and platform actions only.`;

// â”€â”€ Gemini Function Declarations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FUNCTION_DECLARATIONS = [
  {
    name: "lookup_account",
    description: "Get full details for a specific hospital/account including contacts, opportunities, recent activities, and invoices",
    parameters: { type: "object", properties: { name: { type: "string", description: "Account/hospital name or partial name" } }, required: ["name"] },
  },
  {
    name: "lookup_opportunity",
    description: "Get details for a specific opportunity/deal including stage, value, account, and activity history",
    parameters: { type: "object", properties: { query: { type: "string", description: "Opportunity title or account name" } }, required: ["query"] },
  },
  {
    name: "lookup_rep",
    description: "Get a BD rep's pipeline, activities, leads, and performance stats",
    parameters: { type: "object", properties: { name: { type: "string", description: "Rep name or partial name" } }, required: ["name"] },
  },
  {
    name: "get_overdue_items",
    description: "Get all overdue follow-ups, cold deals with no activity in 30+ days, and past-due leads",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "search_referral_sources",
    description: "Search referral sources by name, type, city, state, or specialty",
    parameters: { type: "object", properties: { query: { type: "string", description: "Name, city, state, type, or specialty to search" } }, required: ["query"] },
  },
  {
    name: "log_activity",
    description: "Log a CRM activity (call, visit, email, note, meeting, etc.) against an account or opportunity",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", description: "CALL, EMAIL, NOTE, MEETING, LUNCH, TASK, PROPOSAL_SENT, CONTRACT_SENT, DEMO_COMPLETED, SITE_VISIT, CONFERENCE, FOLLOW_UP" },
        title: { type: "string", description: "Short title/summary of the activity" },
        account_name: { type: "string", description: "Hospital/account name to associate with (optional)" },
        opportunity_title: { type: "string", description: "Opportunity title to associate with (optional)" },
        notes: { type: "string", description: "Detailed notes (optional)" },
      },
      required: ["type", "title"],
    },
  },
  {
    name: "update_deal_stage",
    description: "Move an opportunity to a new pipeline stage",
    parameters: {
      type: "object",
      properties: {
        opportunity_title: { type: "string", description: "Opportunity title (partial match ok)" },
        new_stage: { type: "string", description: "DISCOVERY, QUALIFICATION, DEMO, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST, ON_HOLD" },
      },
      required: ["opportunity_title", "new_stage"],
    },
  },
  {
    name: "create_lead",
    description: "Create a new lead/prospect in the CRM",
    parameters: {
      type: "object",
      properties: {
        hospital_name: { type: "string", description: "Name of the prospect" },
        city: { type: "string", description: "City (optional)" },
        state: { type: "string", description: "State (optional)" },
        contact_name: { type: "string", description: "Primary contact name (optional)" },
        notes: { type: "string", description: "Notes or context (optional)" },
      },
      required: ["hospital_name"],
    },
  },
];

// â”€â”€ Tool Executor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function executeTool(name: string, args: Record<string, unknown>, userId: string, role: string): Promise<string> {
  try {
    if (name === "lookup_account") {
      const q = String(args.name ?? "");
      const accounts = await prisma.hospital.findMany({
        where: { hospitalName: { contains: q, mode: "insensitive" } },
        take: 3,
        include: {
          contacts: { take: 3 },
          opportunities: { orderBy: { updatedAt: "desc" }, take: 5 },
          activities: { orderBy: { createdAt: "desc" }, take: 5, include: { rep: { include: { user: { select: { name: true } } } } } },
          invoices: { orderBy: { createdAt: "desc" }, take: 3 },
        },
      });
      if (!accounts.length) return `No account found matching "${q}".`;
      return accounts.map(a => {
        const opps = a.opportunities.map(o => `  â€¢ ${o.title} â€” ${o.stage}, $${Number(o.value ?? 0).toLocaleString()}`).join("\n");
        const acts = a.activities.map(ac => `  â€¢ [${ac.type}] ${ac.title} (${new Date(ac.createdAt).toLocaleDateString()})`).join("\n");
        const invs = a.invoices.map(i => `  â€¢ #${i.invoiceNumber} $${Number(i.totalAmount).toLocaleString()} â€” ${i.status}`).join("\n");
        return `**${a.hospitalName}** (${a.hospitalType}, ${a.status})\nLocation: ${[a.city, a.state].filter(Boolean).join(", ")}\nContact: ${a.primaryContactName ?? "none"}${a.primaryContactTitle ? ` (${a.primaryContactTitle})` : ""}\n\nOpportunities:\n${opps || "  None"}\n\nRecent Activities:\n${acts || "  None"}\n\nInvoices:\n${invs || "  None"}`;
      }).join("\n\n---\n\n");
    }

    if (name === "lookup_opportunity") {
      const q = String(args.query ?? "");
      const opps = await prisma.opportunity.findMany({
        where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { hospital: { hospitalName: { contains: q, mode: "insensitive" } } }] },
        take: 5,
        include: {
          hospital: { select: { hospitalName: true, city: true, state: true } },
          assignedRep: { include: { user: { select: { name: true } } } },
          activities: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      });
      if (!opps.length) return `No opportunity found matching "${q}".`;
      return opps.map(o => {
        const lastAct = o.activities[0];
        const daysSince = lastAct ? Math.floor((Date.now() - new Date(lastAct.createdAt).getTime()) / 86400000) : null;
        const acts = o.activities.map(a => `  â€¢ [${a.type}] ${a.title} (${new Date(a.createdAt).toLocaleDateString()})`).join("\n");
        return `**${o.title}**\nAccount: ${o.hospital.hospitalName} (${[o.hospital.city, o.hospital.state].filter(Boolean).join(", ")})\nStage: ${o.stage} | Value: $${Number(o.value ?? 0).toLocaleString()} | Priority: ${o.priority}\nRep: ${o.assignedRep?.user.name ?? "unassigned"} | Close: ${o.closeDate ? new Date(o.closeDate).toLocaleDateString() : "none"}\n${daysSince !== null ? `Last activity: ${daysSince} days ago` : "No activities logged"}\n\nActivities:\n${acts || "  None"}`;
      }).join("\n\n---\n\n");
    }

    if (name === "lookup_rep") {
      const q = String(args.name ?? "");
      const rep = await prisma.rep.findFirst({
        where: { user: { name: { contains: q, mode: "insensitive" } } },
        include: {
          user: { select: { name: true, email: true } },
          territories: true,
          opportunities: { include: { hospital: { select: { hospitalName: true } } }, orderBy: { updatedAt: "desc" } },
          leads: { orderBy: { updatedAt: "desc" }, take: 10 },
          activities: { orderBy: { createdAt: "desc" }, take: 10 },
          referralSources: { include: { _count: { select: { referrals: true } } } },
        },
      });
      if (!rep) return `No rep found matching "${q}".`;
      const stageMap = rep.opportunities.reduce((acc, o) => { acc[o.stage] = (acc[o.stage] ?? 0) + 1; return acc; }, {} as Record<string, number>);
      const totalVal = rep.opportunities.reduce((s, o) => s + Number(o.value ?? 0), 0);
      const cold = rep.opportunities.filter(o => !["CLOSED_WON","CLOSED_LOST"].includes(o.stage) && new Date(o.updatedAt) < new Date(Date.now() - 30*86400000));
      return `**${rep.user.name ?? rep.user.email}** â€” ${rep.title ?? "BD Rep"}\nTerritory: ${(rep.territory ?? rep.territories.map(t => t.state).join(", ")) || "not set"} | Status: ${rep.status}\n\nPipeline: ${rep.opportunities.length} deals, $${totalVal.toLocaleString()} total\n${Object.entries(stageMap).map(([s,c]) => `  â€¢ ${s}: ${c}`).join("\n")}\n${cold.length ? `\nâš ï¸ Cold (30+ days): ${cold.map(o => o.title).join(", ")}\n` : ""}Leads: ${rep.leads.length} | Referral Sources: ${rep.referralSources.length} (${rep.referralSources.reduce((s,r) => s + r._count.referrals, 0)} referrals)\nRecent: ${rep.activities.slice(0,5).map(a => `[${a.type}] ${a.title}`).join("; ")}`;
    }

    if (name === "get_overdue_items") {
      const thirtyAgo = new Date(Date.now() - 30*86400000);
      let repId: string | undefined;
      if (role === "REP") { const r = await prisma.rep.findUnique({ where: { userId } }); repId = r?.id; }
      const [coldOpps, overdueLeads] = await Promise.all([
        prisma.opportunity.findMany({
          where: { updatedAt: { lt: thirtyAgo }, stage: { notIn: ["CLOSED_WON","CLOSED_LOST"] }, ...(repId ? { assignedRepId: repId } : {}) },
          include: { hospital: { select: { hospitalName: true } }, assignedRep: { include: { user: { select: { name: true } } } } },
          orderBy: { updatedAt: "asc" }, take: 20,
        }),
        prisma.lead.findMany({
          where: { nextFollowUp: { lt: new Date() }, status: { notIn: ["WON","LOST","UNQUALIFIED"] }, ...(repId ? { assignedRepId: repId } : {}) },
          orderBy: { nextFollowUp: "asc" }, take: 20,
        }),
      ]);
      const parts: string[] = [];
      if (coldOpps.length) parts.push(`**${coldOpps.length} Cold Deals (30+ days no activity):**\n${coldOpps.map(o => `  â€¢ ${o.title} @ ${o.hospital.hospitalName} â€” ${o.stage}, $${Number(o.value ?? 0).toLocaleString()}, last updated ${new Date(o.updatedAt).toLocaleDateString()}${o.assignedRep ? " (" + o.assignedRep.user.name + ")" : ""}`).join("\n")}`);
      if (overdueLeads.length) parts.push(`**${overdueLeads.length} Overdue Lead Follow-ups:**\n${overdueLeads.map(l => `  â€¢ ${l.hospitalName} â€” ${l.status}, was due ${new Date(l.nextFollowUp!).toLocaleDateString()}`).join("\n")}`);
      return parts.length ? parts.join("\n\n") : "No overdue items â€” you're all caught up! ðŸŽ‰";
    }

    if (name === "search_referral_sources") {
      const q = String(args.query ?? "");
      const sources = await prisma.referralSource.findMany({
        where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }, { state: { contains: q, mode: "insensitive" } }, { specialty: { contains: q, mode: "insensitive" } }], active: true },
        include: { _count: { select: { referrals: true } }, assignedRep: { include: { user: { select: { name: true } } } } },
        take: 15,
      });
      if (!sources.length) return `No active referral sources found matching "${q}".`;
      return `Found ${sources.length} referral source(s):\n${sources.map(rs => `  â€¢ **${rs.name}** (${rs.type}${rs.specialty ? ", " + rs.specialty : ""}) â€” ${[rs.city, rs.state].filter(Boolean).join(", ")} | ${rs._count.referrals} referrals | Rep: ${rs.assignedRep?.user.name ?? "unassigned"}`).join("\n")}`;
    }

    if (name === "log_activity") {
      const validTypes = ["CALL","EMAIL","NOTE","MEETING","LUNCH","TASK","PROPOSAL_SENT","CONTRACT_SENT","DEMO_COMPLETED","SITE_VISIT","CONFERENCE","FOLLOW_UP"];
      const type = String(args.type ?? "NOTE").toUpperCase();
      const activityType = validTypes.includes(type) ? type : "NOTE";
      let repId: string | undefined;
      if (role === "REP" || role === "ADMIN") { const r = await prisma.rep.findUnique({ where: { userId } }); repId = r?.id; }
      let hospitalId: string | undefined;
      if (args.account_name) { const h = await prisma.hospital.findFirst({ where: { hospitalName: { contains: String(args.account_name), mode: "insensitive" } } }); hospitalId = h?.id; }
      let opportunityId: string | undefined;
      if (args.opportunity_title) { const o = await prisma.opportunity.findFirst({ where: { title: { contains: String(args.opportunity_title), mode: "insensitive" } } }); opportunityId = o?.id; if (!hospitalId && o) hospitalId = o.hospitalId; }
      await prisma.activity.create({ data: { type: activityType as never, title: String(args.title), notes: args.notes ? String(args.notes) : undefined, repId, hospitalId, opportunityId, completedAt: new Date() } });
      return `âœ… Activity logged: [${activityType}] "${args.title}"${args.account_name ? ` @ ${args.account_name}` : ""}${args.opportunity_title ? ` on "${args.opportunity_title}"` : ""}.`;
    }

    if (name === "update_deal_stage") {
      const validStages = ["DISCOVERY","QUALIFICATION","DEMO","PROPOSAL","NEGOTIATION","CLOSED_WON","CLOSED_LOST","ON_HOLD"];
      const newStage = String(args.new_stage ?? "").toUpperCase();
      if (!validStages.includes(newStage)) return `Invalid stage "${args.new_stage}". Valid: ${validStages.join(", ")}`;
      const opp = await prisma.opportunity.findFirst({ where: { title: { contains: String(args.opportunity_title ?? ""), mode: "insensitive" } }, include: { hospital: { select: { hospitalName: true } } } });
      if (!opp) return `No opportunity found matching "${args.opportunity_title}".`;
      await prisma.opportunity.update({ where: { id: opp.id }, data: { stage: newStage as never } });
      return `âœ… **${opp.title}** (@ ${opp.hospital.hospitalName}) moved from **${opp.stage}** â†’ **${newStage}**.`;
    }

    if (name === "create_lead") {
      let repId: string | undefined;
      if (role === "REP") { const r = await prisma.rep.findUnique({ where: { userId } }); repId = r?.id; }
      await prisma.lead.create({ data: { hospitalName: String(args.hospital_name), city: args.city ? String(args.city) : undefined, state: args.state ? String(args.state) : undefined, contactName: args.contact_name ? String(args.contact_name) : undefined, notes: args.notes ? String(args.notes) : undefined, assignedRepId: repId, status: "NEW" } });
      return `âœ… New lead created: **${args.hospital_name}**${[args.city, args.state].filter(Boolean).length ? " (" + [args.city, args.state].filter(Boolean).join(", ") + ")" : ""}. It's now in the Leads section.`;
    }

    return `Unknown tool: ${name}`;
  } catch (err) {
    console.error(`Tool ${name} error:`, err);
    return `Error running ${name}: ${err instanceof Error ? err.message : "unknown error"}`;
  }
}

// â”€â”€ Live snapshot (opening context) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function buildSnapshotContext(userId: string, role: string): Promise<string> {
  try {
    if (role === "ADMIN") {
      const [stageGroups, leadGroups, accountGroups, referralsThisMonth] = await Promise.all([
        prisma.opportunity.groupBy({ by: ["stage"], _count: { id: true }, _sum: { value: true } }),
        prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.hospital.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.referral.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      ]);
      const totalPipeline = stageGroups.reduce((s, g) => s + Number(g._sum.value ?? 0), 0);
      return `\n## Live Snapshot (${new Date().toLocaleDateString()})\nPipeline: ${stageGroups.map(s => `${s.stage}: ${s._count.id} ($${Number(s._sum.value??0).toLocaleString()})`).join(" | ")} | Total: $${totalPipeline.toLocaleString()}\nLeads: ${leadGroups.map(l => `${l.status}: ${l._count.id}`).join(" | ")}\nAccounts: ${accountGroups.map(a => `${a.status}: ${a._count.id}`).join(" | ")}\nReferrals this month: ${referralsThisMonth}\n`;
    }
    if (role === "REP") {
      const rep = await prisma.rep.findUnique({ where: { userId }, include: { user: { select: { name: true } }, territories: true } });
      if (!rep) return "";
      const [opps, leads] = await Promise.all([
        prisma.opportunity.groupBy({ by: ["stage"], where: { assignedRepId: rep.id }, _count: { id: true }, _sum: { value: true } }),
        prisma.lead.count({ where: { assignedRepId: rep.id, status: { notIn: ["WON","LOST","UNQUALIFIED"] } } }),
      ]);
      const total = opps.reduce((s, o) => s + Number(o._sum.value ?? 0), 0);
      return `\n## Your Snapshot â€” ${rep.user.name} (${new Date().toLocaleDateString()})\nTerritory: ${(rep.territory ?? rep.territories.map(t => t.state).join(", ")) || "not set"}\nPipeline: ${opps.map(o => `${o.stage}: ${o._count.id}`).join(" | ")} | Total: $${total.toLocaleString()}\nOpen Leads: ${leads}\n`;
    }
  } catch (err) {
    console.error("Snapshot error:", err);
  }
  return "";
}

// â”€â”€ POST Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function POST(req: NextRequest) {
  let session;
  try { session = await auth(); } catch { /* ignore */ }
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = await req.json() as { messages: { role: string; content: string }[] };
  if (!Array.isArray(messages) || messages.length === 0) return NextResponse.json({ error: "No messages provided" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ role: "assistant", content: "âš ï¸ AI not configured. Add **GEMINI_API_KEY** to Vercel environment variables." });

  const userId = session.user.id;
  const role = session.user.role;

  // â”€â”€ Load conversation memory (last 30 messages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const memory = await prisma.aiChatMessage.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 });
  const memoryText = memory.length
    ? `\n## Conversation History (most recent last)\n${memory.reverse().map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n")}\n`
    : "";

  const snapshot = await buildSnapshotContext(userId, role);
  const systemPrompt = BASE_SYSTEM_PROMPT + snapshot + memoryText;

  // â”€â”€ Save the latest user message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  if (lastUserMsg) await prisma.aiChatMessage.create({ data: { userId, role: "user", content: lastUserMsg.content } });

  // â”€â”€ Build Gemini contents (merge consecutive same-role turns) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const rawContents: GeminiContent[] = messages.map(m => ({ role: m.role === "assistant" ? "model" as const : "user" as const, parts: [{ text: m.content }] }));
  const contents: GeminiContent[] = [];
  for (const msg of rawContents) {
    const last = contents[contents.length - 1];
    if (last?.role === msg.role) last.parts.push(...msg.parts);
    else contents.push({ ...msg, parts: [...msg.parts] });
  }

  // â”€â”€ Gemini function-calling loop (max 5 tool-call rounds) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  let currentContents = [...contents];
  let finalText = "";

  for (let iter = 0; iter < 5; iter++) {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: currentContents,
        tools: [{ function_declarations: FUNCTION_DECLARATIONS }],
        tool_config: { function_calling_config: { mode: "AUTO" } },
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini error:", err);
      return NextResponse.json({ error: "AI service error â€” please try again." }, { status: 502 });
    }

    const data = await res.json() as { candidates: { content: { role: string; parts: GeminiPart[] } }[] };
    const parts = data.candidates?.[0]?.content?.parts ?? [];

    const functionCalls = parts.filter((p): p is { functionCall: { name: string; args: Record<string, unknown> } } => "functionCall" in p);

    if (functionCalls.length === 0) {
      finalText = (parts.find((p): p is { text: string } => "text" in p))?.text ?? "";
      break;
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(functionCalls.map(fc => executeTool(fc.functionCall.name, fc.functionCall.args, userId, role)));

    currentContents = [
      ...currentContents,
      { role: "model" as const, parts },
      { role: "user" as const, parts: functionCalls.map((fc, i) => ({ functionResponse: { name: fc.functionCall.name, response: { result: toolResults[i] } } })) },
    ];
  }

  if (!finalText) finalText = "I ran into an issue generating a response. Please try again.";

  // â”€â”€ Save assistant reply + trim memory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.aiChatMessage.create({ data: { userId, role: "assistant", content: finalText } });
  const msgCount = await prisma.aiChatMessage.count({ where: { userId } });
  if (msgCount > 200) {
    const oldest = await prisma.aiChatMessage.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: msgCount - 200 });
    await prisma.aiChatMessage.deleteMany({ where: { id: { in: oldest.map(m => m.id) } } });
  }

  return NextResponse.json({ role: "assistant", content: finalText });
}

