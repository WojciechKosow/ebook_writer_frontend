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
  | "PENDING"
  | "PLANNING"
  | "WRITING"
  | "EDITING"
  | "RENDERING"
  | "COMPLETED"
  | "FAILED";

export type ChapterStatus = "PENDING" | "WRITTEN" | "EDITED" | "FAILED";

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
  chapters: ChapterProgress[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface EbookRequestInput {
  topic: string;
  targetAudience: string;
  style: string;
  approxPageCount: number;
  language: string;
  additionalInstructions: string;
  sourceMaterial: string;
}

// ---- Credits & billing -----------------------------------------------------

export type CreditTransactionType =
  | "SUBSCRIPTION_GRANT"
  | "CREDIT_PURCHASE"
  | "GENERATION"
  | "GENERATION_REFUND"
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

