const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem("accessToken", token);
};

export const clearAccessToken = (): void => {
  localStorage.removeItem("accessToken");
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = getAccessToken();

    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : "Something went wrong";

    throw new ApiError(message, response.status);
  }

  return result as T;
}
