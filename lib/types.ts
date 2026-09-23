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
  style: string;
  language: string;
  additionalInstructions: string;
  sourceMaterial: string;
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

