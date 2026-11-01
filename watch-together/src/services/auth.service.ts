import { apiRequest, setAccessToken, clearAccessToken } from "@/lib/api";

import type {
  AuthResponse,
  CurrentUserResponse,
  LoginInput,
  RegisterInput,
  RegisterResponse,
  User,
} from "../types/auth";

export const register = async (input: RegisterInput): Promise<User> => {
  const response = await apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.user;
};

export const login = async (input: LoginInput): Promise<User> => {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  setAccessToken(response.data.accessToken);

  return response.data.user;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiRequest<CurrentUserResponse>(
    "/auth/me",
    {
      method: "GET",
    },
    true,
  );

  return response.data.user;
};

export const logout = (): void => {
  clearAccessToken();
};
