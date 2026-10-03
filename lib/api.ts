import type {
  AuthResponse,
  BlueprintOverview,
  BlueprintUpdateInput,
  CheckoutResponse,
  CreditBalanceResponse,
  CreditPack,
  EbookContentResponse,
  EbookContentUpdateInput,
  EbookImage,
  EbookImageUpdateInput,
  EbookRequestInput,
  EbookStatusResponse,
  GenerationBudgetResponse,
  BookScopeResponse,
  BookDepth,
  ScopeDecision,
  KnowledgeOverview,
  KnowledgeSource,
  OrderStatus,
  SubscriptionResponse,
  User,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

/** Error carrying the backend's message and (optional) per-field validation errors. */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  body?: unknown;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  /** Send the httpOnly refresh cookie (used by refresh/logout). */
  withCredentials?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, withCredentials } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Always include credentials so the refresh cookie flows when same-site.
    credentials: withCredentials ? "include" : "same-origin",
  });

  const raw = await res.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw; // plain-text responses (register/verify/reset/etc.)
    }
  }

  if (!res.ok) {
    const obj = (data && typeof data === "object" ? (data as Record<string, unknown>) : null);
    const message =
      (obj && typeof obj.message === "string" && obj.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    const fieldErrors =
      obj && typeof obj.errors === "object"
        ? (obj.errors as Record<string, string>)
        : undefined;
    throw new ApiError(message, res.status, fieldErrors, data);
  }

  return data as T;
}

// ---- Auth endpoints --------------------------------------------------------

export const authApi = {
  register(input: { displayName: string; email: string; password: string }) {
    return request<string>("/api/auth/register", { method: "POST", body: input });
  },

  login(input: { email: string; password: string; rememberMe: boolean }) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: input,
      withCredentials: true,
    });
  },

  logout() {
    return request<void>("/api/auth/logout", { method: "POST", withCredentials: true });
  },

  refresh() {
    return request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      withCredentials: true,
    });
  },

  me(token: string) {
    return request<User>("/api/auth/me", { token });
  },

  verify(tokenId: string, token: string) {
    return request<string>(
      `/api/auth/verify?tokenId=${encodeURIComponent(tokenId)}&token=${encodeURIComponent(token)}`,
    );
  },

  resendVerification(email: string) {
    return request<string>("/api/auth/resend-verification-email", {
      method: "POST",
      body: { email },
    });
  },

  forgotPassword(email: string) {
    return request<string>("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  /** Trade the one-time code from /auth/callback for a session (sets the refresh cookie). */
  oauthExchange(input: { code: string; clientState: string; rememberMe: boolean }) {
    return request<AuthResponse>("/api/auth/oauth2/exchange", {
      method: "POST",
      body: input,
      withCredentials: true,
    });
  },

  resetPassword(tokenId: string, token: string, newPassword: string) {
    return request<string>(
      `/api/auth/reset-password?tokenId=${encodeURIComponent(tokenId)}&token=${encodeURIComponent(token)}`,
      { method: "POST", body: { newPassword } },
    );
  },
};

// ---- Ebook endpoints -------------------------------------------------------

export const ebookApi = {
  /** Create a draft (no credits held, not generating yet). */
  create(token: string, input: EbookRequestInput) {
    return request<EbookStatusResponse>("/api/ebooks", {
      method: "POST",
      body: input,
      token,
    });
  },

  /** Reserve credits and start generating a draft. */
  start(token: string, id: string) {
    return request<EbookStatusResponse>(`/api/ebooks/${id}/start`, {
      method: "POST",
      token,
    });
  },

  get(token: string, id: string) {
    return request<EbookStatusResponse>(`/api/ebooks/${id}`, { token });
  },

  /** Resume a failed generation: written chapters are kept, the missing ones are written (new credit hold). */
  resume(token: string, id: string) {
    return request<EbookStatusResponse>(`/api/ebooks/${id}/resume`, { method: "POST", token });
  },

  /**
   * The creation form's depth options, each with a preliminary length/credit
   * estimate from the brief typed so far, plus the balance. The user picks a
   * depth, never a page count.
   */
  generationBudget(token: string, brief?: { briefChars?: number; sourceChars?: number }) {
    const q = new URLSearchParams();
    if (brief?.briefChars) q.set("briefChars", String(brief.briefChars));
    if (brief?.sourceChars) q.set("sourceChars", String(brief.sourceChars));
    const qs = q.toString();
    return request<GenerationBudgetResponse>(`/api/ebooks/generation-budget${qs ? `?${qs}` : ""}`, { token });
  },

  /** A draft's length + credit estimate (refined by its materials and blueprint). */
  scope(token: string, id: string) {
    return request<BookScopeResponse>(`/api/ebooks/${id}/scope`, { token });
  },

  /** Have Scrivetta's AI assess the draft's scope (cached server-side until inputs change). */
  assessScope(token: string, id: string) {
    return request<BookScopeResponse>(`/api/ebooks/${id}/scope/assess`, { method: "POST", token });
  },

  /** Answer a book paused because it turned out longer than agreed. */
  decideScope(token: string, id: string, decision: ScopeDecision) {
    return request<EbookStatusResponse>(`/api/ebooks/${id}/scope-decision`, {
      method: "POST",
      body: { decision },
      token,
    });
  },

  /** Change a draft's depth; returns the updated scope. */
  updateDepth(token: string, id: string, depth: BookDepth) {
    return request<BookScopeResponse>(`/api/ebooks/${id}/depth`, { method: "PUT", body: { depth }, token });
  },

  list(token: string) {
    return request<EbookStatusResponse[]>("/api/ebooks", { token });
  },

  /** Load the editable manuscript (all chapters + their Markdown bodies). */
  getContent(token: string, id: string) {
    return request<EbookContentResponse>(`/api/ebooks/${id}/content`, { token });
  },

  /** Save edited chapters; the backend re-renders the PDF so downloads stay in sync. */
  saveContent(token: string, id: string, input: EbookContentUpdateInput) {
    return request<EbookContentResponse>(`/api/ebooks/${id}/content`, {
      method: "PUT",
      body: input,
      token,
    });
  },

  /**
   * Fetch the browser-ready HTML preview of the book (needs the Authorization
   * header — the endpoint returns a self-contained HTML document, not JSON).
   * The editor renders this in a sandboxed iframe and paginates it client-side.
   */
  async previewHtml(token: string, id: string): Promise<string> {
    const res = await fetch(`${API_URL}/api/ebooks/${id}/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `Preview failed (${res.status})`;
      try {
        const obj = JSON.parse(text);
        if (obj?.message) message = obj.message;
      } catch {
        /* keep default */
      }
      throw new ApiError(message, res.status);
    }
    return res.text();
  },

  /**
   * Render a live preview from the editor's current (unsaved) content. Posts the
   * working chapters and returns the same self-contained HTML as `previewHtml`,
   * built from what was sent rather than the stored manuscript. Nothing is saved.
   */
  async previewHtmlLive(
    token: string,
    id: string,
    input: EbookContentUpdateInput,
  ): Promise<string> {
    const res = await fetch(`${API_URL}/api/ebooks/${id}/preview`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `Preview failed (${res.status})`;
      try {
        const obj = JSON.parse(text);
        if (obj?.message) message = obj.message;
      } catch {
        /* keep default */
      }
      throw new ApiError(message, res.status);
    }
    return res.text();
  },

  /** Download the finished PDF as a Blob (needs the Authorization header). */
  /**
   * Download the finished PDF. Asks the backend for a short-lived signed link and
   * lets the browser download it natively (like any file link). Fetching the PDF
   * into a blob instead breaks when a download manager or antivirus intercepts
   * the file mid-transfer (net::ERR_FAILED on a 200), and holds the whole file in
   * page memory; a native download is streamed and compatible with those tools.
   */
  async download(token: string, id: string): Promise<void> {
    const { url } = await request<{ url: string }>(`/api/ebooks/${id}/download-link`, {
      method: "POST",
      token,
    });
    const a = document.createElement("a");
    a.href = `${API_URL}${url}`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
};

// ---- Multipart upload ------------------------------------------------------

/**
 * Upload a file via multipart form data. Uses XHR (not fetch) so the caller can
 * show real upload progress. Resolves with the parsed JSON response.
 */
function uploadMultipart<T>(
  token: string,
  path: string,
  file: File,
  fields: Record<string, string> = {},
  onProgress?: (percent: number) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(fields)) form.append(k, v);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      const raw = xhr.responseText;
      let data: unknown = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = raw;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
        const message =
          (obj && typeof obj.message === "string" && obj.message) ||
          `Upload failed (${xhr.status})`;
        reject(new ApiError(message, xhr.status, undefined, data));
      }
    };
    xhr.onerror = () => reject(new ApiError("Upload failed", xhr.status || 0));
    xhr.send(form);
  });
}

// ---- Asset (image) endpoints -----------------------------------------------

export const imageApi = {
  list(token: string, ebookId: string) {
    return request<EbookImage[]>(`/api/ebooks/${ebookId}/images`, { token });
  },

  /**
   * Upload an image via multipart form data. Uses XHR (not fetch) so the caller
   * can show real upload progress. Resolves with the created asset.
   */
  upload(
    token: string,
    ebookId: string,
    file: File,
    opts: { role?: string; onProgress?: (percent: number) => void } = {},
  ): Promise<EbookImage> {
    return uploadMultipart<EbookImage>(
      token,
      `/api/ebooks/${ebookId}/images`,
      file,
      opts.role ? { role: opts.role } : {},
      opts.onProgress,
    );
  },

  /** Fetch an asset's bytes (auth required — the bucket is private) as a Blob. */
  async fetchBlob(token: string, ebookId: string, imageId: string): Promise<Blob> {
    const res = await fetch(`${API_URL}/api/ebooks/${ebookId}/images/${imageId}/raw`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError(`Failed to load image (${res.status})`, res.status);
    return res.blob();
  },

  update(token: string, ebookId: string, imageId: string, input: EbookImageUpdateInput) {
    return request<EbookImage>(`/api/ebooks/${ebookId}/images/${imageId}`, {
      method: "PATCH",
      body: input,
      token,
    });
  },

  setCover(token: string, ebookId: string, imageId: string) {
    return request<EbookImage>(`/api/ebooks/${ebookId}/images/${imageId}/cover`, {
      method: "PUT",
      token,
    });
  },

  /** Unset the book's cover (the asset stays in the library). */
  clearCover(token: string, ebookId: string) {
    return request<void>(`/api/ebooks/${ebookId}/images/cover`, {
      method: "DELETE",
      token,
    });
  },

  remove(token: string, ebookId: string, imageId: string) {
    return request<void>(`/api/ebooks/${ebookId}/images/${imageId}`, {
      method: "DELETE",
      token,
    });
  },
};

// ---- Knowledge endpoints ("Tell Scrivetta what you know") ------------------

export const knowledgeApi = {
  /** Status, uploaded sources, the learned-knowledge summary, usage and limits. */
  overview(token: string, ebookId: string) {
    return request<KnowledgeOverview>(`/api/ebooks/${ebookId}/knowledge`, { token });
  },

  /** Upload a ZIP / RAR / PDF / DOCX / TXT / MD file. It is read and normalised right away. */
  upload(token: string, ebookId: string, file: File, onProgress?: (percent: number) => void) {
    return uploadMultipart<KnowledgeSource>(token, `/api/ebooks/${ebookId}/knowledge/sources`, file, {}, onProgress);
  },

  /** Save the pasted notes (blank text removes them). */
  setNotes(token: string, ebookId: string, text: string) {
    return request<KnowledgeSource | null>(`/api/ebooks/${ebookId}/knowledge/notes`, {
      method: "PUT",
      body: { text },
      token,
    });
  },

  removeSource(token: string, ebookId: string, sourceId: string) {
    return request<void>(`/api/ebooks/${ebookId}/knowledge/sources/${sourceId}`, {
      method: "DELETE",
      token,
    });
  },

  /** Start processing the materials in the background; poll `overview`. */
  process(token: string, ebookId: string) {
    return request<KnowledgeOverview>(`/api/ebooks/${ebookId}/knowledge/process`, {
      method: "POST",
      token,
    });
  },

  /** Accept the learned knowledge — the book is ready for the Book Blueprint step. */
  continue(token: string, ebookId: string) {
    return request<KnowledgeOverview>(`/api/ebooks/${ebookId}/knowledge/continue`, {
      method: "POST",
      token,
    });
  },
};

// ---- Book Blueprint endpoints ----------------------------------------------

export const blueprintApi = {
  /** Status, the blueprint, the questions (with answers) and summary counts. */
  get(token: string, ebookId: string) {
    return request<BlueprintOverview>(`/api/ebooks/${ebookId}/blueprint`, { token });
  },

  /** Build (or rebuild) the blueprint in the background; poll `get`. `force` confirms rebuilding an edited one. */
  build(token: string, ebookId: string, force = false) {
    return request<BlueprintOverview>(`/api/ebooks/${ebookId}/blueprint/build${force ? "?force=true" : ""}`, {
      method: "POST",
      token,
    });
  },

  update(token: string, ebookId: string, input: BlueprintUpdateInput) {
    return request<BlueprintOverview>(`/api/ebooks/${ebookId}/blueprint`, { method: "PUT", body: input, token });
  },

  answer(token: string, ebookId: string, questionId: string, input: { answer?: string; skip?: boolean }) {
    return request<BlueprintOverview>(`/api/ebooks/${ebookId}/blueprint/questions/${questionId}`, {
      method: "PUT",
      body: input,
      token,
    });
  },

  approve(token: string, ebookId: string) {
    return request<BlueprintOverview>(`/api/ebooks/${ebookId}/blueprint/approve`, { method: "POST", token });
  },
};

// ---- Credits & billing endpoints -------------------------------------------

export const creditApi = {
  balance(token: string) {
    return request<CreditBalanceResponse>("/api/credits", { token });
  },
  packs(token: string) {
    return request<CreditPack[]>("/api/credits/packs", { token });
  },
  purchase(token: string, pack: string) {
    return request<CheckoutResponse>("/api/credits/purchase", {
      method: "POST",
      body: { pack },
      token,
    });
  },
};

export const subscriptionApi = {
  get(token: string) {
    return request<SubscriptionResponse>("/api/subscription", { token });
  },
  checkout(token: string) {
    return request<CheckoutResponse>("/api/subscription/checkout", { method: "POST", token });
  },
  cancel(token: string) {
    return request<SubscriptionResponse>("/api/subscription/cancel", { method: "POST", token });
  },
  resume(token: string) {
    return request<SubscriptionResponse>("/api/subscription/resume", { method: "POST", token });
  },
  portal(token: string) {
    return request<{ url: string }>("/api/subscription/portal", { method: "POST", token });
  },
};

export const paymentApi = {
  order(token: string, orderId: string) {
    return request<OrderStatus>(`/api/payments/orders/${orderId}`, { token });
  },
};
