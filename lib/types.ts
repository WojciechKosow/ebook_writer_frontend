// Shared types mirroring the backend DTOs.

export interface User {
  id: string;
  displayName: string;
  email: string;
  enabled?: boolean;
}

export interface AuthResponse {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

// ---- Ebook -----------------------------------------------------------------

export type EbookStatus =
  | "DRAFT"
  | "PENDING"
  | "PLANNING"
  | "WRITING"
  | "EDITING"
  | "PLANNING_IMAGES"
  | "GENERATING_IMAGES"
  | "RENDERING"
  | "COMPLETED"
  | "FAILED";

/**
 * DEFERRED: planned but left out of this book because the credits couldn't
 * cover the whole outline — the book was wound down to a natural ending instead
 * of being cut off. Never rendered; kept for a future "continue" feature.
 */
export type ChapterStatus = "PENDING" | "WRITTEN" | "EDITED" | "FAILED" | "DEFERRED";

/**
 * How deep the book goes — the user's only control over scope. Scrivetta
 * determines the length from the topic, the materials and the depth; the page
 * count is a result of generation, never an input.
 */
export type BookDepth = "QUICK" | "STANDARD" | "COMPREHENSIVE";

export interface ChapterProgress {
  chapterNumber: number;
  title: string;
  status: ChapterStatus;
}

export interface EbookStatusResponse {
  id: string;
  status: EbookStatus;
  progress: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  errorMessage: string | null;
  downloadReady: boolean;
  /** The depth the user selected. */
  depth: BookDepth;
  /**
   * Scrivetta's length estimate taken when generation started (whole-book pages).
   * An estimate, not a target. Null for drafts — see `ebookApi.scope`.
   */
  estimatedPagesLow: number | null;
  estimatedPagesHigh: number | null;
  /** Pages of the actual plan once planned (still a plan, not a promise). */
  plannedPages: number | null;
  /**
   * True when the writing ran past what the credits cover and the book was
   * brought to its planned ending early (see the DEFERRED chapters).
   */
  creditLimited: boolean;
  /**
   * The real number of pages in the finished PDF (0 until COMPLETED) — the
   * result of generation, not an order.
   */
  actualPageCount: number;
  /** Credits actually charged for this generation (1 credit = 1 final page). */
  creditsCharged: number;
  /** LEGACY = written from the brief; KNOWLEDGE = written from the author's knowledge + blueprint. */
  generationMode: "LEGACY" | "KNOWLEDGE";
  /** A failed generation that kept its written chapters and can be resumed. */
  resumable: boolean;
  chapters: ChapterProgress[];
  createdAt: string | null;
  updatedAt: string | null;
}

// ---- Ebook content (editor) ------------------------------------------------

/** Whether a piece of content/placement is still AI output or a user edit. */
export type ContentSource = "AI" | "USER";

export interface ChapterContent {
  /** Stable server id — echoed back on save to identify edits vs. new chapters. */
  id: string;
  chapterNumber: number;
  title: string | null;
  /** Chapter body in Markdown — what the editor loads and saves. */
  content: string | null;
  contentSource?: ContentSource;
}

export interface EbookContentResponse {
  id: string;
  status: EbookStatus;
  title: string | null;
  subtitle: string | null;
  editable: boolean;
  chapters: ChapterContent[];
}

export interface ChapterUpdateInput {
  /** Existing chapter id, or null to add a new chapter. List order sets the number. */
  id: string | null;
  title: string;
  content: string;
}

export interface EbookContentUpdateInput {
  chapters: ChapterUpdateInput[];
}

// ---- Assets (images) -------------------------------------------------------

export type AssetRole =
  | "GENERAL"
  | "LOGO"
  | "AUTHOR"
  | "PRODUCT"
  | "COVER"
  | "ILLUSTRATION";

export type AssetPlacement = "UNUSED" | "COVER" | "CHAPTER";

/** A project asset (image), mirroring the backend EbookImageDTO. */
export interface EbookImage {
  id: string;
  role: AssetRole;
  placement: AssetPlacement;
  chapterId: string | null;
  placedBy: ContentSource | null;
  displayWidthPercent: number | null;
  /** Crop focal point for the cover, as % of width/height (null = centre). */
  focalX: number | null;
  focalY: number | null;
  contentType: string;
  originalFilename: string | null;
  sizeBytes: number;
  width: number;
  height: number;
  aiDescription: string | null;
  tags: string[];
  /** Token to place this asset inside a chapter's Markdown: ebook-image:<id>. */
  markdownRef: string;
  /** Relative API path that streams the bytes (needs the Authorization header). */
  rawUrl: string;
  createdAt: string | null;
}

export interface EbookImageUpdateInput {
  role?: AssetRole;
  displayWidthPercent?: number;
  /** 0–100: the point a cropped placement (the cover) is framed around. */
  focalX?: number;
  focalY?: number;
}

export interface EbookRequestInput {
  topic: string;
  targetAudience: string;
  /** What the book should achieve for its reader (its goal / purpose). */
  bookGoal?: string;
  style: string;
  language: string;
  additionalInstructions: string;
  sourceMaterial: string;
  /** Optional author/pen name printed on the cover ("by …"). */
  authorName?: string;
  /** How deep the book should go. Omit for STANDARD. */
  depth?: BookDepth;
}

/** What an estimate is based on, from least to most informed. */
export type ScopeBasis = "BRIEF" | "SOURCE_TEXT" | "KNOWLEDGE" | "BLUEPRINT";

/**
 * One length estimate. Every figure is an ESTIMATE: the real length follows the
 * content and may land outside the range. 1 credit ≈ 1 final page.
 */
export interface ScopeEstimate {
  depth: BookDepth;
  label: string;
  description: string;
  pagesLow: number;
  pagesHigh: number;
  chaptersLow: number;
  chaptersHigh: number;
  creditsLow: number;
  creditsHigh: number;
  /** Credits needed to start (the high end), so the book is never cut short for credits. */
  requiredCredits: number;
  basis: ScopeBasis;
  /** Provided material, in pages of source text. */
  sourcePages: number;
  /** True when the content suggested more than the per-book maximum. */
  capped: boolean;
}

/** The creation form, before a draft exists: a preliminary estimate per depth. */
export interface GenerationBudgetResponse {
  balance: number;
  defaultDepth: BookDepth;
  options: ScopeEstimate[];
  maxPages: number;
}

/** A draft's scope (refined by materials and the blueprint) and whether it can start. */
export interface BookScopeResponse {
  depth: BookDepth;
  estimate: ScopeEstimate;
  options: ScopeEstimate[];
  balance: number;
  /** The estimate's high end — or the size of an earlier plan that came out larger. */
  requiredCredits: number;
  canGenerate: boolean;
  /** Size of an earlier plan that needed more credits than the user had. */
  plannedPages: number | null;
  maxPages: number;
}

// ---- Credits & billing -----------------------------------------------------

export type CreditTransactionType =
  | "SUBSCRIPTION_GRANT"
  | "CREDIT_PURCHASE"
  | "GENERATION"
  | "GENERATION_REFUND"
  | "GENERATION_ADJUSTMENT"
  | "SIGNUP_BONUS";

export interface CreditTransaction {
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string | null;
  ebookId: string | null;
  createdAt: string | null;
}

export interface CreditBalanceResponse {
  balance: number;
  transactions: CreditTransaction[];
}

export interface CreditPack {
  id: string;
  credits: number;
  priceCents: number;
  displayName: string;
}

export interface SubscriptionResponse {
  active: boolean;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export interface CheckoutResponse {
  orderId: string;
  url: string;
}

export interface OrderStatus {
  orderId: string;
  status: string;
  purpose: string;
  creditsGranted: number;
}


// ---- Knowledge ("Tell Scrivetta what you know") ---------------------------

/**
 * Lifecycle of a book's knowledge ingestion — separate from EbookStatus (the
 * book stays a DRAFT throughout).
 */
export type KnowledgeStatus =
  | "CREATED"
  | "MATERIALS_UPLOADING"
  | "PROCESSING"
  | "ANALYZING"
  | "KNOWLEDGE_READY"
  | "READY_FOR_BLUEPRINT"
  | "FAILED";

export type KnowledgeSourceType = "ZIP" | "PDF" | "DOCX" | "TXT" | "MD" | "NOTES";

export interface KnowledgeSource {
  id: string;
  sourceType: KnowledgeSourceType;
  filename: string;
  sizeBytes: number;
  /** EXTRACTED, PARTIAL (some files skipped) or FAILED (unreadable — ignored). */
  status: "EXTRACTED" | "PARTIAL" | "FAILED";
  errorMessage: string | null;
  documentCount: number;
  skippedCount: number;
  extractedChars: number;
  skipped: { path: string; reason: string }[];
  createdAt: string | null;
}

export interface KnowledgeSummary {
  projectName: string | null;
  projectType: string | null;
  overallSummary: string | null;
  technologies: string[];
  topicsFound: number;
  processesFound: number;
  examplesFound: number;
  userInsightsFound: number;
  termsFound: number;
  importantDetailsFound: number;
  /** Uploaded sources (files + notes) that were analysed. */
  sourcesAnalyzed: number;
  /** Individual documents analysed (e.g. files inside a ZIP). */
  documentsAnalyzed: number;
  documentsNotAnalyzed: number;
  duplicatesSkipped: number;
  knowledgeGaps: number;
  topTopics: string[];
  intendedSequence: string[];
  gapQuestions: string[];
}

export interface KnowledgeOverview {
  ebookId: string;
  status: KnowledgeStatus;
  errorMessage: string | null;
  hasKnowledge: boolean;
  readyForBlueprint: boolean;
  /** False when the server has no OpenAI key — processing can't start. */
  processingAvailable: boolean;
  sources: KnowledgeSource[];
  /** The saved pasted notes, or null. */
  notes: string | null;
  summary: KnowledgeSummary | null;
  usage: {
    model: string | null;
    openAiCalls: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
    analyzedChars: number;
    chunks: number;
    processingRuns: number;
    maxProcessingRuns: number;
  } | null;
  limits: { maxUploadBytes: number; maxSources: number; maxNotesChars: number; acceptedFormats: string[] };
  warnings: string[];
  startedAt: string | null;
  completedAt: string | null;
}

// ---- Book Blueprint --------------------------------------------------------

/** Lifecycle of a book's blueprint (the plan built from its knowledge). */
export type BlueprintStatus =
  | "NOT_STARTED"
  | "BUILDING_BLUEPRINT"
  | "BLUEPRINT_REVIEW"
  | "QUESTIONS_REQUIRED"
  | "BLUEPRINT_READY"
  | "FAILED";

export interface BlueprintChapter {
  id: string;
  order: number;
  title: string;
  purpose: string | null;
  topics: string[];
  keyPoints: { point: string; sources: string[] }[];
  knowledgeReferences: { type: string; name: string }[];
  /** Source documents the chapter draws on (paths in the author's materials, or "user-notes"). */
  sourceReferences: string[];
  gapIds: string[];
  origin: "AI" | "AUTHOR";
  edited: boolean;
}

export interface BlueprintGap {
  id: string;
  description: string;
  whyItMatters: string | null;
  severity: "critical" | "important" | "minor";
  chapterIds: string[];
  status: "OPEN" | "ANSWERED" | "SKIPPED" | "NOT_ASKED";
  questionId: string | null;
}

export interface Blueprint {
  concept: string | null;
  workingTitle: string | null;
  subtitle: string | null;
  audience: string | null;
  readerGoal: string | null;
  promise: string | null;
  structureRationale: string | null;
  chapters: BlueprintChapter[];
  knowledgeGaps: BlueprintGap[];
  userEditedFields: string[];
}

export interface BlueprintQuestion {
  id: string;
  gapId: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  question: string;
  reason: string | null;
  priority: number;
  status: "OPEN" | "ANSWERED" | "SKIPPED";
  answer: string | null;
  answeredAt: string | null;
}

export interface BlueprintOverview {
  ebookId: string;
  status: BlueprintStatus;
  errorMessage: string | null;
  knowledgeReady: boolean;
  /** The knowledge changed since the blueprint was built. */
  knowledgeOutdated: boolean;
  buildAvailable: boolean;
  userEdited: boolean;
  blueprint: Blueprint | null;
  questions: BlueprintQuestion[];
  summary: {
    chapters: number;
    groundedChapters: number;
    knowledgeGaps: number;
    openGaps: number;
    questions: number;
    answered: number;
    skipped: number;
    open: number;
  } | null;
  usage: { model: string | null; generation: number; maxGenerations: number } | null;
  warnings: string[];
  generatedAt: string | null;
  readyAt: string | null;
}

export interface BlueprintUpdateInput {
  workingTitle?: string;
  subtitle?: string;
  concept?: string;
  audience?: string;
  readerGoal?: string;
  promise?: string;
  /** Authoritative list: order = new order; id null = new chapter; missing = removed. */
  chapters?: { id: string | null; title: string; purpose: string | null; topics?: string[] }[];
}
