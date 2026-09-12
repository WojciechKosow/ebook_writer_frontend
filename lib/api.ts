import type {
  AuthResponse,
  CheckoutResponse,
  CreditBalanceResponse,
  CreditPack,
  EbookContentResponse,
  EbookContentUpdateInput,
  EbookImage,
  EbookImageUpdateInput,
  EbookRequestInput,
  EbookStatusResponse,
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

  /** Download the finished PDF as a Blob (needs the Authorization header). */
  async download(token: string, id: string): Promise<Blob> {
    const res = await fetch(`${API_URL}/api/ebooks/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `Download failed (${res.status})`;
      try {
        const obj = JSON.parse(text);
        if (obj?.message) message = obj.message;
      } catch {
        /* keep default */
      }
      throw new ApiError(message, res.status);
    }
    return res.blob();
  },
};

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
    return new Promise<EbookImage>((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      if (opts.role) form.append("role", opts.role);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/api/ebooks/${ebookId}/images`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && opts.onProgress) {
          opts.onProgress(Math.round((e.loaded / e.total) * 100));
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
          resolve(data as EbookImage);
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

  remove(token: string, ebookId: string, imageId: string) {
    return request<void>(`/api/ebooks/${ebookId}/images/${imageId}`, {
      method: "DELETE",
      token,
    });
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
