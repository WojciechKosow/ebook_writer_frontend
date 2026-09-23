import type { EbookRequestInput } from "./types";

/**
 * The unsent new-ebook brief is kept on this device under this key, so a
 * refresh doesn't lose it — and so other pages (e.g. the empty library's
 * ideas) can hand the form a pre-filled brief.
 */
export const BRIEF_DRAFT_KEY = "scrivetta:new-ebook-brief";

/**
 * Example briefs across very different genres — so the form shows the breadth
 * of what Scrivetta can write. Each is a complete, ready-to-run example.
 */
export type Example = {
  tag: string;
  topic: string;
  audience: string;
  style: string;
  instructions: string;
};

export const EXAMPLES: Example[] = [
  {
    tag: "Literary fiction",
    topic: "A quiet novel about two estranged sisters reunited one summer on the coast",
    audience: "Adult readers who love character-driven literary fiction",
    style: "Lyrical, introspective, emotionally honest",
    instructions:
      "Alternate points of view between the sisters. Let the sea and the tides mirror their relationship. Avoid melodrama.",
  },
  {
    tag: "SaaS",
    topic: "Building and scaling a B2B SaaS product from zero to first 100 customers",
    audience: "Technical founders and early-stage product teams",
    style: "Practical, direct, example-driven",
    instructions:
      "Cover pricing, onboarding, churn, and go-to-market. Include real playbooks and checklists at the end of each chapter.",
  },
  {
    tag: "E-commerce",
    topic: "Launching a profitable Shopify store: from first product to repeat customers",
    audience: "First-time online store owners and side-hustlers",
    style: "Encouraging, step-by-step, no jargon",
    instructions:
      "Walk through product research, branding, product photography, ads, and email flows. Add a launch checklist and common mistakes.",
  },
  {
    tag: "Children's book",
    topic: "A bedtime story about a little fox who is afraid of the dark",
    audience: "Children aged 4–7 and the parents reading to them",
    style: "Warm, rhythmic, gently reassuring",
    instructions:
      "Keep sentences short and soothing. End on a calm, comforting note perfect for falling asleep.",
  },
  {
    tag: "Personal finance",
    topic: "A beginner's guide to investing your first $1,000 with confidence",
    audience: "Young adults new to money and investing",
    style: "Friendly, reassuring, jargon-free",
    instructions:
      "Explain index funds, compounding, and risk in plain language. Include a simple month-by-month starter plan.",
  },
];

/**
 * Pre-fill the new-ebook form with an example brief. The form restores it on
 * load; returns false when storage is unavailable.
 */
export function saveExampleBrief(example: Example, targetPages?: number): boolean {
  const form: Partial<EbookRequestInput> = {
    topic: example.topic,
    targetAudience: example.audience,
    style: example.style,
    additionalInstructions: example.instructions,
  };
  try {
    localStorage.setItem(BRIEF_DRAFT_KEY, JSON.stringify({ form, target: targetPages ?? null }));
    return true;
  } catch {
    return false;
  }
}
