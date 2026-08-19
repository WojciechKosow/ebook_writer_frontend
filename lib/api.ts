import type {
  AuthResponse,
  EbookRequestInput,
  EbookStatusResponse,
  User,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

/** Error carrying the backend's message and (optional) per-field validation errors. */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
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
    throw new ApiError(message, res.status, fieldErrors);
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
  create(token: string, input: EbookRequestInput) {
    return request<EbookStatusResponse>("/api/ebooks", {
      method: "POST",
      body: input,
      token,
    });
  },

  get(token: string, id: string) {
    return request<EbookStatusResponse>(`/api/ebooks/${id}`, { token });
  },

  list(token: string) {
    return request<EbookStatusResponse[]>("/api/ebooks", { token });
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
