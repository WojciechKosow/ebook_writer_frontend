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
  /** Paused: the book turned out clearly longer than agreed — waiting for the user's decision. */
  | "AWAITING_APPROVAL"
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
  /** The whole-book length the user has agreed to (estimate's high end, or a later approval). */
  approvedPages: number | null;
  /** While AWAITING_APPROVAL: the length Scrivetta now expects. */
  proposedPages: number | null;
  /** While AWAITING_APPROVAL: "PLAN" (after planning) or "WRITING" (mid-book). */
  approvalStage: "PLAN" | "WRITING" | null;
  /** Credits that must be additionally reserved to continue at the proposed length (0 = none). */
  extraCreditsToContinue: number;
  /** The user chose to keep the book within the agreed length. */
  fitToBudget: boolean;
  /**
   * The real number of pages in the finished PDF (0 until COMPLETED) — the
   * result of generation, not an order.
   */
  actualPageCount: number;
  /**
   * Credits held while the book generates, then what it was charged: its final
   * pages, AI illustrations and AI cover.
   */
  creditsCharged: number;
  /** The page rate the book is billed at; 1 for books made under the old (1 credit = 1 page) system. */
  creditsPerPage: number;
  /** LEGACY = written from the brief; KNOWLEDGE = written from the author's knowledge + blueprint. */
  generationMode: "LEGACY" | "KNOWLEDGE";
  /** A failed generation that kept its written chapters and can be resumed. */
  resumable: boolean;
  /** From the latest render's quality report: errors / warnings found (null until rendered). */
  qualityErrors: number | null;
  qualityWarnings: number | null;
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

/** An image in the user's asset library, mirroring the backend LibraryAssetDTO. */
export interface LibraryAsset {
  id: string;
  contentType: string;
  originalFilename: string | null;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: string | null;
  /** When the asset is deleted (without Pro); null = kept. */
  expiresAt: string | null;
  /** Relative API path that streams the bytes (needs the Authorization header). */
  rawUrl: string;
}

/** The user's asset library. `kept` is true with Pro; otherwise assets expire after `retentionHours`. */
export interface AssetLibrary {
  kept: boolean;
  retentionHours: number;
  assets: LibraryAsset[];
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
 * content and may land outside the range. Credits are estimated from the pages
 * (at `creditsPerPage`) plus the AI images reserve.
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
  /** Current credits per finished page. */
  creditsPerPage: number;
  basis: ScopeBasis;
  /** Provided material, in pages of source text. */
  sourcePages: number;
  /** True when the content suggested more than the per-book maximum. */
  capped: boolean;
  /** True when OpenAI's scope assessment shaped the range. */
  aiAssessed: boolean;
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
  /** UNAVAILABLE (no OpenAI) · NEEDED (call ebookApi.assessScope) · READY */
  aiAssessment: "UNAVAILABLE" | "NEEDED" | "READY";
  /** What drives the length, per the AI assessment. */
  aiRationale: string | null;
}

/** The user's answer when a book paused because it turned out longer. */
export type ScopeDecision = "CONTINUE" | "FIT" | "CANCEL";

// ---- Credits & billing -----------------------------------------------------

export type CreditTransactionType =
  | "SUBSCRIPTION_GRANT"
  | "SUBSCRIPTION_EXPIRY"
  | "CREDIT_PURCHASE"
  | "GENERATION"
  | "GENERATION_REFUND"
  | "GENERATION_ADJUSTMENT"
  | "COVER_GENERATION"
  | "REFUND_CLAWBACK"
  | "SIGNUP_BONUS"
  | "ECONOMY_MIGRATION";

export interface CreditTransaction {
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string | null;
  ebookId: string | null;
  createdAt: string | null;
}

export interface CreditBalanceResponse {
  /** Spendable total. */
  balance: number;
  /** This billing period's Pro credits — used first, replaced at renewal. */
  subscriptionCredits: number;
  /** Credits from packs — never expire (negative only during a small generation overdraft). */
  purchasedCredits: number;
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

// ---- Quality report ---------------------------------------------------------

export type QualitySeverity = "ERROR" | "WARNING" | "INFO";

export type QualityCategory =
  | "INCOMPLETE_UNIT"
  | "EMPTY_HEADING"
  | "ORPHAN_LIST_MARKER"
  | "DUPLICATE_BLOCK"
  | "TEMPLATE_MISMATCH"
  | "INTERNAL_LEAK"
  | "TRUNCATED_READER_TEXT"
  | "VERBATIM_OVERFLOW"
  | "REPETITION"
  | "LENGTH_BUDGET";

/** One finding, located in the book (chapter null = the book as a whole; page null = not printed). */
export interface QualityFinding {
  category: QualityCategory;
  severity: QualitySeverity;
  chapter: number | null;
  chapterTitle: string | null;
  page: number | null;
  message: string;
  excerpt: string | null;
}

/** The quality report of a book's latest render (GET /api/ebooks/{id}/quality-report). */
export interface QualityReport {
  generatedAt: string;
  pages: number;
  plannedPages: number | null;
  errors: number;
  warnings: number;
  readyToPublish: boolean;
  /** Most severe first, then in book order. */
  findings: QualityFinding[];
  lengths: { chapter: number; title: string; plannedPages: number; actualPages: number; deviation: number }[];
  repeatedPhrases: { phrase: string; occurrences: number; chapters: number[] }[];
}

// ---- Creator stores (Stripe Connect) ---------------------------------------

/** The author's Stripe account as last fetched from Stripe by the backend. */
/** PENDING_VERIFICATION: everything submitted, Stripe hasn't activated card payments yet. */
export type StripeConnectState = "NOT_CONNECTED" | "ACTION_REQUIRED" | "PENDING_VERIFICATION" | "READY";

export interface StripeStatus {
  state: StripeConnectState;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  currentlyDue: string[];
  syncedAt: string | null;
}

export type ProductFileFormat = "PDF" | "EPUB" | "ZIP";

/** A downloadable file of a store product. `id` is opaque ("ebook-pdf" = the ebook's own PDF). */
export interface ProductFile {
  id: string;
  /** The download name; null on pages before purchase ("What's included"). */
  filename: string | null;
  format: ProductFileFormat;
  sizeBytes: number;
  version: number;
  updatedAt: string | null;
  /** The name buyers see ("For e-readers"); null = the filename. */
  label: string | null;
  /** What it's for, one line. */
  note: string | null;
  /** An account perk: only buyers with a Scrivetta account get it. */
  accountOnly: boolean;
  /** Downloads left on a guest link (null where unlimited). */
  downloadsLeft: number | null;
  /** My Purchases: replaced with a new version since the purchase. */
  updated: boolean;
}

export interface StoreProduct {
  id: string;
  /** The Scrivetta ebook whose PDF is delivered; null for a standalone product (uploaded files only). */
  ebookId: string | null;
  title: string;
  description: string | null;
  /** "What you'll be able to do", one point per line. */
  highlights: string | null;
  /** Price in cents (USD). */
  priceCents: number;
  currency: string;
  active: boolean;
  sortOrder: number;
  /** Pages of the finished PDF (0 if unknown). */
  pageCount: number;
  /** Relative API path of the cover (own cover, else the PDF's first page); null when there is none. */
  coverUrl: string | null;
  /** Whether the author uploaded their own cover. */
  customCover: boolean;
  /** Uploaded downloadable files (current versions). */
  files: ProductFile[];
  /** Whether buyers would get anything (the ebook's PDF or at least one file). */
  deliverable: boolean;
  /** The product page design (JSON, see lib/store-design/product-page), null for defaults. */
  pageSettings: string | null;
  /** The ebook's chapters (empty for a standalone product); `hasText` = can be a free preview. */
  chapters: { number: number; title: string; hasText: boolean }[];
  subtitle: string | null;
  language: string | null;
  /** Shown to buyers right now — the fields above are the draft the author is editing. */
  liveActive: boolean;
  /** The price buyers pay right now. */
  livePriceCents: number;
}

/**
 * One change buyers don't see yet ("Publish changes" applies them all).
 * `before`/`after` are the live and the draft value as text (null = empty).
 */
export interface PendingChange {
  kind: "profile" | "theme" | "order" | "product" | "file";
  productId: string | null;
  fileId: string | null;
  field: string;
  before: string | null;
  after: string | null;
}

/** A chapter buyers can read for free; `html` is sanitised by the backend (no scripts, no images). */
export interface SampleChapter {
  number: number;
  title: string;
  html: string;
}

/** The author's public profile fields, shared by the dashboard and the store. */
export interface StoreProfileFields {
  name: string;
  description: string | null;
  headline: string | null;
  authorName: string | null;
  contactEmail: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
  /** Relative API paths, null when not uploaded. */
  logoUrl: string | null;
  photoUrl: string | null;
}

export interface StoreDashboard extends StoreProfileFields {
  id: string;
  slug: string;
  published: boolean;
  /** Whether the author has Scrivetta PRO — required to publish and sell. */
  pro: boolean;
  stripe: StripeStatus;
  products: StoreProduct[];
  /** The store page design (JSON, see lib/store-design), null for the default (Scrivetta) style. */
  themeSettings: string | null;
  /** Chapters of the first ebook, for designs that show its contents. */
  featuredChapters: { number: number; title: string }[];
  /** What "Publish changes" would apply; every other field already shows the draft. */
  changes: PendingChange[];
  /** When the draft was last saved; null when nothing is pending. */
  draftSavedAt: string | null;
}

/** The seller as buyers see them on every store page. */
export interface StoreProfile extends StoreProfileFields {
  slug: string;
  /** False with an honest reason when the store can't take payments right now. */
  purchasable: boolean;
  unavailableReason: string | null;
}

export interface PublicStoreProduct {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number;
  currency: string;
  pageCount: number;
  language: string | null;
  coverUrl: string | null;
}

export interface PublicStore {
  store: StoreProfile;
  products: PublicStoreProduct[];
  /** The store page design (JSON, see lib/store-design), null for the default (Scrivetta) style. */
  themeSettings: string | null;
  /** Chapters of the first (featured) ebook. */
  featuredChapters: { number: number; title: string }[];
}

export interface PublicProduct {
  store: StoreProfile;
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  highlights: string[];
  priceCents: number;
  currency: string;
  pageCount: number;
  language: string | null;
  updatedAt: string | null;
  coverUrl: string | null;
  chapters: { number: number; title: string }[];
  /** What buyers get, e.g. ["PDF", "EPUB"]. */
  formats: ProductFileFormat[];
  more: PublicStoreProduct[];
  /** The store's design (JSON) — the product page uses the same style. */
  themeSettings: string | null;
  /** The product page design (JSON), null for defaults. */
  pageSettings: string | null;
  /** Chapters buyers can read for free. */
  sampleChapters: { number: number; title: string }[];
  /** What's included: every file a buyer gets (no download names), account perks marked. */
  included: ProductFile[];
  /** The guest download rule: each file `downloadLimit` times within `downloadDays` days. */
  downloadLimit: number;
  downloadDays: number;
}

export type StoreOrderStatus = "PENDING" | "PAID" | "EXPIRED" | "REFUNDED";

export interface StoreOrderStatusResponse {
  orderId: string;
  status: StoreOrderStatus;
  productTitle: string | null;
  storeSlug: string | null;
  storeName: string | null;
  /** The product's page design (JSON) — for the author's thank-you. */
  pageSettings: string | null;
  productId: string;
  coverUrl: string | null;
  /** The rest is only there for the buyer's own browser (with the Checkout Session id). */
  amount: number | null;
  /** Where the download link was emailed. */
  buyerEmail: string | null;
  /** The files, each with its downloads left — null until the payment is confirmed. */
  files: ProductFile[] | null;
  /** Account perks a guest doesn't get. */
  perks: ProductFile[] | null;
  expiresAt: string | null;
  /** Already linked to a Scrivetta account (it's in their My purchases). */
  inLibrary: boolean | null;
  downloadLimit: number;
}

export interface StoreCheckoutResponse {
  orderId: string;
  checkoutUrl: string;
}

export interface DownloadInfo {
  productTitle: string;
  storeName: string | null;
  storeSlug: string | null;
  authorName: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  /** Total size of all files. */
  fileSizeBytes: number;
  /** Every file of the purchase, each with its own downloads left. */
  files: ProductFile[];
  /** Downloads left across all files. */
  downloadsRemaining: number;
  expiresAt: string;
  /** Other ebooks still on sale in the store. */
  more: PublicStoreProduct[];
  /** The seller's profile (null if the store is gone), the store design and the product page design. */
  store: StoreProfile | null;
  themeSettings: string | null;
  pageSettings: string | null;
  /** Account perks this link leaves out ("comes with a free account"). */
  perks: ProductFile[];
  /** Downloads per file. */
  downloadLimit: number;
}

/** One paid purchase in My Purchases. */
export interface Purchase {
  orderId: string;
  productId: string;
  productTitle: string;
  storeName: string | null;
  /** Null when the store isn't published any more. */
  storeSlug: string | null;
  authorName: string | null;
  contactEmail: string | null;
  coverUrl: string | null;
  amount: number;
  currency: string;
  purchasedAt: string | null;
  /** Whether the product is still on sale (the files stay yours either way). */
  onSale: boolean;
  /** Account perks included; `updated` marks a file replaced since the purchase. */
  files: ProductFile[];
  /** When the latest of those updates happened, or null. */
  updatedAt: string | null;
}
