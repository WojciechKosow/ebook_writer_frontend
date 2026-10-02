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
  /**
   * The target length the user selected — a soft content budget. The finished
   * book lands around it but may be a little shorter or longer.
   */
  targetPages: number;
  /**
   * The real number of pages in the finished PDF (0 until COMPLETED) — the
   * result of generation, not an order.
   */
  actualPageCount: number;
  /** Credits actually charged for this generation (1 credit = 1 final page). */
  creditsCharged: number;
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
  /**
   * Selected target length in pages — a soft content budget that shapes the
   * plan (chapters, depth, exercises). Never a hard limit: the book isn't cut to
   * fit it or padded to reach it. Omit to use the default.
   */
  targetPages?: number;
}

/**
 * What the creation UI needs: the target-length options (a soft content budget
 * that shapes the plan) and the credit budget (the only hard limit — 1 credit
 * pays for 1 final page, billed on the real result).
 */
export interface GenerationBudgetResponse {
  /** Smallest balance that may start a standard generation. */
  minCredits: number;
  /** Low end of the orientational page range (~20). */
  estimatedPagesLow: number;
  /** High end of the orientational page range (~30). */
  estimatedPagesHigh: number;
  /** The user's current credit balance. */
  balance: number;
  /** Whether the balance is enough to start now (at the default target). */
  canGenerate: boolean;
  /** Target lengths offered by the form (e.g. 20, 30, 50, 75, 100). */
  targetOptions: number[];
  /** Target used when none is selected. */
  defaultTargetPages: number;
  /** Largest target accepted. */
  maxTargetPages: number;
  /**
   * Roughly how many pages the balance pays for. A target above this is planned
   * down to what the user can afford, and ends naturally rather than being cut.
   */
  affordablePages: number;
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
