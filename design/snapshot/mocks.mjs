// Sample backend responses so the signed-in screens render with realistic data
// without a running API. Shapes mirror lib/types.ts.

const now = "2026-10-08T10:15:00Z";

const user = { id: "u1", displayName: "Anna Kowalska", email: "anna@example.com", enabled: true };

const chaptersDone = [
  "Why habits beat motivation",
  "The anatomy of a routine",
  "Designing your morning",
  "Deep work blocks",
  "Managing energy, not time",
  "Recovering from setbacks",
  "Making it stick for good",
].map((title, i) => ({ chapterNumber: i + 1, title, status: "WRITTEN" }));

function book(over) {
  return {
    id: "b0",
    status: "COMPLETED",
    progress: 100,
    title: "Untitled",
    subtitle: null,
    description: null,
    errorMessage: null,
    downloadReady: false,
    depth: "STANDARD",
    estimatedPagesLow: 38,
    estimatedPagesHigh: 52,
    plannedPages: 46,
    creditLimited: false,
    approvedPages: 52,
    proposedPages: null,
    approvalStage: null,
    extraCreditsToContinue: 0,
    fitToBudget: false,
    actualPageCount: 0,
    creditsCharged: 0,
    generationMode: "LEGACY",
    resumable: false,
    qualityErrors: null,
    qualityWarnings: null,
    chapters: [],
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

export const books = {
  done: book({
    id: "b-done",
    title: "The Quiet Productivity Method",
    subtitle: "Build calm, focused routines that last",
    description: "A practical guide for busy professionals who want to get more done with less stress.",
    downloadReady: true,
    actualPageCount: 48,
    creditsCharged: 48,
    qualityErrors: 0,
    qualityWarnings: 2,
    chapters: chaptersDone,
    createdAt: "2026-10-01T09:00:00Z",
    updatedAt: "2026-10-01T09:40:00Z",
  }),
  writing: book({
    id: "b-writing",
    status: "WRITING",
    progress: 57,
    title: "Sourdough at Home",
    subtitle: "From starter to perfect loaf",
    plannedPages: 36,
    generationMode: "KNOWLEDGE",
    chapters: [
      ["Meet your starter", "WRITTEN"],
      ["Flour, water, salt", "WRITTEN"],
      ["The first bake", "WRITTEN"],
      ["Shaping and scoring", "WRITTEN"],
      ["Troubleshooting dense loaves", "PENDING"],
      ["Beyond the basic loaf", "PENDING"],
      ["Your baking calendar", "PENDING"],
    ].map(([title, status], i) => ({ chapterNumber: i + 1, title, status })),
    createdAt: "2026-10-08T10:00:00Z",
  }),
  draft: book({
    id: "b-draft",
    status: "DRAFT",
    progress: 0,
    title: "Shipping SaaS Solo",
    subtitle: null,
    estimatedPagesLow: null,
    estimatedPagesHigh: null,
    plannedPages: null,
    approvedPages: null,
    generationMode: "KNOWLEDGE",
    createdAt: "2026-10-09T14:00:00Z",
  }),
  failed: book({
    id: "b-failed",
    status: "FAILED",
    progress: 40,
    title: "A Beginner's Guide to Watercolor",
    errorMessage: "Generation stopped while writing chapter 4.",
    resumable: true,
    chapters: [
      ["Materials you actually need", "WRITTEN"],
      ["Color mixing basics", "WRITTEN"],
      ["Washes and gradients", "WRITTEN"],
      ["Wet-on-wet techniques", "FAILED"],
      ["Painting your first landscape", "PENDING"],
    ].map(([title, status], i) => ({ chapterNumber: i + 1, title, status })),
    createdAt: "2026-09-20T08:00:00Z",
  }),
  done2: book({
    id: "b-done2",
    title: "Remote Team Playbook",
    subtitle: "Rituals, tools and trust for distributed teams",
    downloadReady: true,
    actualPageCount: 62,
    creditsCharged: 62,
    qualityErrors: 1,
    qualityWarnings: 0,
    depth: "COMPREHENSIVE",
    chapters: chaptersDone,
    createdAt: "2026-09-12T08:00:00Z",
  }),
};

const scopeEst = (depth, label, description, lo, hi, chLo, chHi) => ({
  depth,
  label,
  description,
  pagesLow: lo,
  pagesHigh: hi,
  chaptersLow: chLo,
  chaptersHigh: chHi,
  creditsLow: lo,
  creditsHigh: hi,
  requiredCredits: hi,
  basis: "BLUEPRINT",
  sourcePages: 14,
  capped: false,
  aiAssessed: true,
});

const scopeOptions = [
  scopeEst("QUICK", "Quick guide", "The essentials, short and to the point.", 18, 26, 4, 6),
  scopeEst("STANDARD", "Standard book", "A complete, well-rounded book on the topic.", 38, 52, 7, 9),
  scopeEst("COMPREHENSIVE", "In-depth", "Covers the topic thoroughly, with extra examples.", 70, 95, 11, 14),
];

const scope = {
  depth: "STANDARD",
  estimate: scopeOptions[1],
  options: scopeOptions,
  balance: 120,
  requiredCredits: 52,
  canGenerate: true,
  plannedPages: null,
  maxPages: 150,
  aiAssessment: "READY",
  aiRationale: "Your materials cover pricing, onboarding and churn in depth; a standard book fits them well.",
};

const knowledge = {
  ebookId: "b-draft",
  status: "READY_FOR_BLUEPRINT",
  errorMessage: null,
  hasKnowledge: true,
  readyForBlueprint: true,
  processingAvailable: true,
  sources: [
    {
      id: "s1", sourceType: "ZIP", filename: "saas-notes-2025.zip", sizeBytes: 4_210_000, status: "PARTIAL",
      errorMessage: null, documentCount: 23, skippedCount: 2, extractedChars: 184_000,
      skipped: [{ path: "assets/logo.psd", reason: "Unsupported format" }, { path: "old/draft.pages", reason: "Unsupported format" }],
      createdAt: now,
    },
    {
      id: "s2", sourceType: "PDF", filename: "pricing-experiments.pdf", sizeBytes: 812_000, status: "EXTRACTED",
      errorMessage: null, documentCount: 1, skippedCount: 0, extractedChars: 32_000, skipped: [], createdAt: now,
    },
    {
      id: "s3", sourceType: "NOTES", filename: "Pasted notes", sizeBytes: 2_400, status: "EXTRACTED",
      errorMessage: null, documentCount: 1, skippedCount: 0, extractedChars: 2_400, skipped: [], createdAt: now,
    },
  ],
  notes: "I bootstrapped two SaaS products to $20k MRR without a team. Focus on what worked: narrow ICP, annual plans, founder-led sales.",
  summary: {
    projectName: "Shipping SaaS Solo",
    projectType: "Business guide",
    overallSummary: "Hands-on lessons from building and growing small SaaS products alone — validation, pricing, onboarding, support and churn.",
    technologies: ["Stripe", "Postgres", "Next.js"],
    topicsFound: 18, processesFound: 9, examplesFound: 14, userInsightsFound: 7, termsFound: 22, importantDetailsFound: 31,
    sourcesAnalyzed: 3, documentsAnalyzed: 25, documentsNotAnalyzed: 2, duplicatesSkipped: 1, knowledgeGaps: 3,
    topTopics: ["Validation", "Pricing", "Onboarding", "Founder-led sales", "Churn"],
    intendedSequence: ["Idea", "Validate", "Build", "Launch", "Grow"],
    gapQuestions: [],
  },
  usage: null,
  limits: { maxUploadBytes: 50_000_000, maxSources: 10, maxNotesChars: 20_000, acceptedFormats: ["zip", "pdf", "docx", "txt", "md"] },
  warnings: [],
  startedAt: now,
  completedAt: now,
};

const bpChapters = [
  ["Pick a problem you can own", "Choose a niche small enough to dominate alone."],
  ["Validate before you build", "Cheap tests that prove people will pay."],
  ["The smallest shippable product", "Scope a v1 you can build in six weeks."],
  ["Pricing that funds you", "Annual plans, anchors and why cheap is expensive."],
  ["Onboarding that converts", "Get users to their first win in minutes."],
  ["Founder-led sales", "Demos, cold emails and closing without a sales team."],
  ["Keeping customers", "Support, churn interviews and win-backs."],
  ["Growing without burning out", "Systems, automation and saying no."],
].map(([title, purpose], i) => ({
  id: `c${i + 1}`,
  order: i + 1,
  title,
  purpose,
  topics: ["Examples", "Checklist"],
  keyPoints: [{ point: purpose, sources: ["saas-notes-2025.zip"] }],
  knowledgeReferences: [],
  sourceReferences: ["notes/chapter.md"],
  gapIds: i === 3 ? ["g1"] : [],
  origin: "AI",
  edited: false,
}));

const blueprint = {
  ebookId: "b-draft",
  status: "QUESTIONS_REQUIRED",
  errorMessage: null,
  knowledgeReady: true,
  knowledgeOutdated: false,
  buildAvailable: true,
  userEdited: false,
  blueprint: {
    concept: "A no-fluff field guide to building a profitable SaaS on your own, drawn from two real products.",
    workingTitle: "Shipping SaaS Solo",
    subtitle: "Build, launch and grow a profitable product without a team",
    audience: "Developers and indie hackers planning their first paid product",
    readerGoal: "Launch a SaaS that reaches its first $1k MRR",
    promise: "Every chapter ends with a step you can take this week.",
    structureRationale: "Follows the lifecycle of a product from idea to sustainable growth.",
    chapters: bpChapters,
    knowledgeGaps: [
      { id: "g1", description: "No data on how pricing changes affected churn.", whyItMatters: "Readers will want to know the risk.", severity: "important", chapterIds: ["c4"], status: "OPEN", questionId: "q1" },
    ],
    userEditedFields: [],
  },
  questions: [
    { id: "q1", gapId: "g1", chapterId: "c4", chapterTitle: "Pricing that funds you", question: "When you raised prices, did existing customers churn? Roughly how many?", reason: "Chapter 4 recommends raising prices; a real number makes it credible.", priority: 1, status: "OPEN", answer: null, answeredAt: null },
    { id: "q2", gapId: null, chapterId: "c6", chapterTitle: "Founder-led sales", question: "What was your best-performing cold email subject line?", reason: "A concrete example for the sales chapter.", priority: 2, status: "ANSWERED", answer: "“Quick question about your invoicing” — 41% open rate.", answeredAt: now },
  ],
  summary: { chapters: 8, groundedChapters: 7, knowledgeGaps: 1, openGaps: 1, questions: 2, answered: 1, skipped: 0, open: 1 },
  usage: { model: null, generation: 1, maxGenerations: 3 },
  warnings: [],
  generatedAt: now,
  readyAt: null,
};

const content = {
  id: "b-done",
  status: "COMPLETED",
  title: books.done.title,
  subtitle: books.done.subtitle,
  editable: true,
  chapters: chaptersDone.map((c, i) => ({
    id: `ch${i + 1}`,
    chapterNumber: c.chapterNumber,
    title: c.title,
    contentSource: "AI",
    content:
      i === 0
        ? `Most productivity advice starts with motivation. This book starts somewhere quieter: with the small, repeatable actions that keep working when motivation runs out.\n\n## The motivation trap\n\nMotivation is a feeling, and feelings change. On Monday you plan a perfect week; by Wednesday the plan has slipped and the guilt has set in. The problem was never your willpower — it was the system.\n\n> A habit is a decision you no longer have to make.\n\n## What you will learn\n\n- How to design routines that survive busy weeks\n- Why energy, not time, is your real budget\n- A simple weekly review that takes fifteen minutes\n\nIn the next chapter we take a routine apart and look at each of its pieces.`
        : `Chapter ${i + 1} content.\n\n## Section\n\nLorem ipsum dolor sit amet.`,
  })),
};

const previewHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#e9e6e1;font-family:Georgia,serif;color:#222}
.page{width:432px;min-height:648px;margin:16px auto;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.15);padding:56px 48px;box-sizing:border-box}
h1{font-size:26px;margin:0 0 6px}h2{font-size:16px;margin:22px 0 8px}.kicker{font:600 11px/1 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#a0522d;margin-bottom:14px}
p{font-size:12.5px;line-height:1.6;margin:0 0 10px}blockquote{border-left:3px solid #a0522d;margin:14px 0;padding:2px 12px;font-style:italic;font-size:12.5px}
</style></head><body>
<div class="page"><div class="kicker">Chapter 1</div><h1>Why habits beat motivation</h1>
<p>Most productivity advice starts with motivation. This book starts somewhere quieter: with the small, repeatable actions that keep working when motivation runs out.</p>
<h2>The motivation trap</h2><p>Motivation is a feeling, and feelings change. On Monday you plan a perfect week; by Wednesday the plan has slipped and the guilt has set in. The problem was never your willpower — it was the system.</p>
<blockquote>A habit is a decision you no longer have to make.</blockquote>
<h2>What you will learn</h2><p>How to design routines that survive busy weeks, why energy, not time, is your real budget, and a simple weekly review that takes fifteen minutes.</p></div>
</body></html>`;

const qualityReport = {
  generatedAt: now,
  pages: 48,
  plannedPages: 46,
  errors: 0,
  warnings: 2,
  readyToPublish: true,
  findings: [
    { category: "REPETITION", severity: "WARNING", chapter: 3, chapterTitle: "Designing your morning", page: 14, message: "The phrase “at the end of the day” appears 4 times in this chapter.", excerpt: "…and at the end of the day, the routine is what remains…" },
    { category: "LENGTH_BUDGET", severity: "WARNING", chapter: 5, chapterTitle: "Managing energy, not time", page: null, message: "Chapter is 40% longer than planned.", excerpt: null },
  ],
  lengths: chaptersDone.map((c, i) => ({ chapter: c.chapterNumber, title: c.title, plannedPages: 6, actualPages: i === 4 ? 9 : 6, deviation: i === 4 ? 0.4 : 0 })),
  repeatedPhrases: [{ phrase: "at the end of the day", occurrences: 4, chapters: [3] }],
};

const credits = {
  balance: 120,
  transactions: [
    { type: "GENERATION", amount: -48, balanceAfter: 120, description: "The Quiet Productivity Method", ebookId: "b-done", createdAt: "2026-10-01T09:40:00Z" },
    { type: "CREDIT_PURCHASE", amount: 100, balanceAfter: 168, description: "100 credits pack", ebookId: null, createdAt: "2026-09-30T18:00:00Z" },
    { type: "GENERATION_REFUND", amount: 12, balanceAfter: 68, description: "Refund: unused pages", ebookId: "b-done2", createdAt: "2026-09-12T09:00:00Z" },
    { type: "SUBSCRIPTION_GRANT", amount: 50, balanceAfter: 56, description: "Monthly plan credits", ebookId: null, createdAt: "2026-09-01T00:00:00Z" },
    { type: "SIGNUP_BONUS", amount: 6, balanceAfter: 6, description: "Welcome bonus", ebookId: null, createdAt: "2026-08-28T12:00:00Z" },
  ],
};

const packs = [
  { id: "small", credits: 50, priceCents: 900, displayName: "Starter" },
  { id: "medium", credits: 150, priceCents: 2400, displayName: "Writer" },
  { id: "large", credits: 400, priceCents: 5900, displayName: "Studio" },
];

const budget = { balance: 120, defaultDepth: "STANDARD", options: scopeOptions.map((o) => ({ ...o, basis: "BRIEF", aiAssessed: false })), maxPages: 150 };

/** Returns [status, body, contentType] for an API path, or null for 404. */
export function mockApi(method, path, { emptyLibrary = false } = {}) {
  const p = path.split("?")[0];
  const json = (b, s = 200) => [s, JSON.stringify(b), "application/json"];
  if (p === "/api/auth/me") return json(user);
  if (p === "/api/auth/refresh") return json({ token: "demo-token", refreshToken: null, user });
  if (p === "/api/credits") return json(credits);
  if (p === "/api/credits/packs") return json(packs);
  if (p === "/api/subscription") return json({ active: true, status: "ACTIVE", cancelAtPeriodEnd: false, currentPeriodEnd: "2026-11-01T00:00:00Z" });
  if (p === "/api/ebooks/generation-budget") return json(budget);
  if (p === "/api/ebooks" && method === "GET") return json(emptyLibrary ? [] : [books.writing, books.draft, books.done, books.failed, books.done2]);
  const m = p.match(/^\/api\/ebooks\/([^/]+)(\/.*)?$/);
  if (m) {
    const b = Object.values(books).find((x) => x.id === m[1]);
    const rest = m[2] ?? "";
    if (!b) return null;
    if (rest === "") return json(b);
    if (rest === "/scope") return json(scope);
    if (rest === "/scope/assess") return json(scope);
    if (rest === "/knowledge") return json(b.id === "b-draft" ? knowledge : { ...knowledge, ebookId: b.id, status: "CREATED", sources: [], hasKnowledge: false, readyForBlueprint: false, summary: null, notes: null });
    if (rest === "/blueprint") return json(b.id === "b-draft" ? blueprint : { ...blueprint, status: "NOT_STARTED", blueprint: null, questions: [], summary: null });
    if (rest === "/quality-report") return b.qualityErrors === null ? null : json(qualityReport);
    if (rest === "/content") return json({ ...content, id: b.id });
    if (rest === "/images") return json([]);
    if (rest === "/preview") return [200, previewHtml, "text/html"];
  }
  return null;
}
