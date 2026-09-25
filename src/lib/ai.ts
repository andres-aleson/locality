import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Business, GeneratedPlan, PlanAction } from "./types";

const MODEL = "claude-sonnet-5";

// Mirrors the plan_actions CHECK constraints in supabase/schema.sql. Claude is
// instructed to only use these values, but LLM output isn't guaranteed —
// .catch("other") keeps a slightly-off response from failing the DB insert
// and breaking the whole plan for the user.
const generatedPlanSchema = z.object({
  theme: z.string().min(1),
  actions: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        rationale: z.string().min(1),
        action_type: z
          .enum(["content_post", "review_request", "local_outreach", "profile_update", "other"])
          .catch("other"),
        platform: z
          .enum(["google_business_profile", "instagram", "facebook", "in_person", "email", "other"])
          .catch("other"),
      })
    )
    .min(1),
});

let anthropic: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (anthropic !== undefined) return anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  return anthropic;
}

function extractText(content: { type: string; text?: string }[]): string {
  return content
    .map((block) => (block.type === "text" && typeof block.text === "string" ? block.text : ""))
    .join("");
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

export async function generateWeeklyPlan(
  business: Business,
  previousActions?: PlanAction[]
): Promise<GeneratedPlan> {
  const client = getClient();
  if (!client) return mockWeeklyPlan(business, previousActions);

  const continuitySection = previousActions?.length
    ? `\nLast week's plan and progress (build on this — acknowledge what got done, carry forward or follow up on what didn't, don't just repeat it):\n${previousActions
        .map(
          (a) =>
            `- [${a.status === "done" ? "done" : "not done"}] ${a.title} (${a.action_type} / ${a.platform})`
        )
        .join("\n")}\n`
    : "";

  const prompt = `You are an AI marketing coach for first-time local business owners who have little marketing experience, little time, and little budget. Your job is to tell them exactly what to do this week and why — not just generate generic content.

Business profile:
- Name: ${business.name}
- Category: ${business.category}
- Description: ${business.description}
- Target customers: ${business.target_customers}
- Location: ${business.location}
- Growth goals: ${business.goals}
- Existing online presence: ${business.website_or_socials || "none mentioned"}
${continuitySection}
Create this business's marketing plan for the coming week. The plan must:
1. Help them get discovered by local customers without requiring marketing expertise or budget.
2. Help them feel confident about growth, not anxious about where the next customer comes from — keep the plan small and achievable (3-4 actions, each doable in under 30 minutes).
3. Help them build a trustworthy, professional online presence without needing design or branding skills.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching this exact shape:
{
  "theme": "one sentence describing this week's focus",
  "actions": [
    {
      "title": "short action title",
      "description": "specific, concrete instructions for exactly what to do, written directly to the owner",
      "rationale": "one or two sentences on why this action matters for their specific business",
      "action_type": "content_post" | "review_request" | "local_outreach" | "profile_update" | "other",
      "platform": "google_business_profile" | "instagram" | "facebook" | "in_person" | "email" | "other"
    }
  ]
}

Include 3 to 4 actions. Be specific to this business — reference their category, location, or goals — not generic advice.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = extractText(response.content as { type: string; text?: string }[]);

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch (err) {
    throw new Error(
      `Claude returned unparseable plan JSON: ${(err as Error).message}\n\nRaw response:\n${text}`
    );
  }

  const result = generatedPlanSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Claude returned a plan that didn't match the expected shape: ${result.error.message}\n\nRaw response:\n${text}`
    );
  }
  return result.data;
}

export async function generateContentDraft(business: Business, action: PlanAction): Promise<string> {
  const client = getClient();
  if (!client) return mockContentDraft(business, action);

  const prompt = `You are an AI marketing coach writing ready-to-use marketing content for a first-time local business owner. Write in a warm, professional, non-corporate voice a small business owner would actually use.

Business:
- Name: ${business.name}
- Category: ${business.category}
- Description: ${business.description}
- Target customers: ${business.target_customers}
- Location: ${business.location}

This week's action:
- Title: ${action.title}
- What to do: ${action.description}
- Why it matters: ${action.rationale}
- Platform: ${action.platform}
- Type: ${action.action_type}

Write the actual draft content the owner should post/send/say for this action, ready to copy and use with minimal edits. Match the format to the platform (e.g. a short caption for Instagram/Facebook, a brief email or text message for a review request, two or three spoken talking points for in-person outreach, profile copy for a Google Business Profile). Respond with ONLY the draft content itself — no preamble, no explanation, no markdown headers.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  return extractText(response.content as { type: string; text?: string }[]).trim();
}

function stripTrailingPeriod(text: string): string {
  return text.trim().replace(/\.+$/, "");
}

function mockWeeklyPlan(business: Business, previousActions?: PlanAction[]): GeneratedPlan {
  if (previousActions?.length) {
    const doneCount = previousActions.filter((a) => a.status === "done").length;
    const followUps = previousActions
      .filter((a) => a.status !== "done")
      .slice(0, 2)
      .map((a) => ({
        title: `Follow up: ${a.title}`,
        description: `You didn't get to this last week — ${a.description}`,
        rationale: a.rationale,
        action_type: a.action_type,
        platform: a.platform,
      }));

    const freshActionsPool = [
      {
        title: "Share one more update with your audience",
        description: `Post a short update about recent work for ${business.target_customers || "your customers"} — a quick photo or two sentences is enough.`,
        rationale:
          "Staying visible week over week is what turns occasional interest into a habit of choosing you first.",
        action_type: "content_post" as const,
        platform: "instagram" as const,
      },
      {
        title: "Ask one more happy customer for a review",
        description: `Reach out to a recent customer you haven't already asked and request a quick Google review.`,
        rationale:
          "Reviews compound — each new one makes the next customer's decision to trust you a little easier.",
        action_type: "review_request" as const,
        platform: "email" as const,
      },
    ];

    const actionsNeeded = Math.max(1, 3 - followUps.length);

    return {
      theme:
        doneCount === previousActions.length
          ? `Build on last week's momentum for ${business.name}`
          : `Follow through on last week and keep ${business.name} visible in ${business.location}`,
      actions: followUps.concat(freshActionsPool.slice(0, actionsNeeded)),
    };
  }

  return {
    theme: `Get ${business.name} in front of more people in ${business.location} this week`,
    actions: [
      {
        title: "Complete your Google Business Profile",
        description: `Claim (or finish filling out) your Google Business Profile: hours, service area, phone number, and a two-sentence description of ${stripTrailingPeriod(business.description) || "what you do"}. Add at least 3 photos.`,
        rationale:
          "A complete profile is the single biggest lever for showing up in local search and maps — most first-time owners skip this and lose customers to competitors who show up first.",
        action_type: "profile_update",
        platform: "google_business_profile",
      },
      {
        title: "Ask your last 3 happy customers for a review",
        description: `Send a short, friendly text or email to your three most recent satisfied customers asking for a quick Google review. Make it a one-tap link if you can.`,
        rationale:
          "Trust is the biggest barrier for a business with few reviews — a handful of genuine reviews can double the chance a new customer picks up the phone.",
        action_type: "review_request",
        platform: "email",
      },
      {
        title: "Post one behind-the-scenes photo",
        description: `Share one photo of recent work with a two-sentence caption about the problem you solved for ${business.target_customers || "a customer"}.`,
        rationale:
          "Consistent, simple posts build a track record of credibility without needing design skills — one honest photo beats a polished ad.",
        action_type: "content_post",
        platform: "instagram",
      },
      {
        title: "Introduce yourself to one nearby complementary business",
        description: `Visit or call one local business in ${business.location} that serves the same customers but isn't a competitor, and propose referring customers to each other.`,
        rationale:
          "Word-of-mouth from a trusted local peer converts better than any ad, and it costs nothing but a conversation.",
        action_type: "local_outreach",
        platform: "in_person",
      },
    ],
  };
}

function mockContentDraft(business: Business, action: PlanAction): string {
  const byPlatform: Record<string, string> = {
    google_business_profile: `${business.name} — ${stripTrailingPeriod(business.description) || "serving " + (business.location || "the local area")}.\n\nWe help ${business.target_customers || "local customers"} with reliable, professional service. Reach out today to see how we can help.`,
    instagram: `Another job done right for ${business.target_customers || "a great customer"} in ${business.location || "the neighborhood"} 💪\n\n${action.description}\n\nDM us or call to get on the schedule.`,
    facebook: `Another job done right for ${business.target_customers || "a great customer"} in ${business.location || "the neighborhood"}.\n\n${action.description}\n\nMessage us or call to get on the schedule.`,
    email: `Subject: Quick favor?\n\nHi [Name],\n\nThanks again for trusting ${business.name} recently — it meant a lot. If you have 60 seconds, a quick Google review would really help other folks in ${business.location || "the area"} find us.\n\n[Review link]\n\nThank you!\n${business.name}`,
    in_person: `Talking points:\n1. Introduce yourself and ${business.name} — what you do in one sentence.\n2. Mention you both serve ${business.target_customers || "similar customers"} in ${business.location || "the area"} and aren't competitors.\n3. Propose trading referrals when a customer needs the other's service.`,
    other: action.description,
  };

  return (
    (byPlatform[action.platform] || byPlatform.other) +
    `\n\n[Placeholder draft — set ANTHROPIC_API_KEY in .env.local to generate real, tailored copy for ${business.name}.]`
  );
}
