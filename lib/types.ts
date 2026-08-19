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
