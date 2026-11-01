"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { ApiError, getAccessToken, clearAccessToken } from "@/lib/api";
import {
  login as loginUser,
  register as registerUser,
  getCurrentUser,
  logout as logoutUser,
} from "../services/auth.service";

import type { User, LoginInput, RegisterInput } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  initializationError: string | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof ApiError && error.statusCode === 401) {
          clearAccessToken();
        } else {
          setInitializationError(
            "Could not verify your session. Please check your connection and try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (input: LoginInput): Promise<void> => {
    const loggedInUser = await loginUser(input);
    setUser(loggedInUser);
    setInitializationError(null);
  };

  const signUp = async (input: RegisterInput): Promise<User> => {
    return registerUser(input);
  };

  const signOut = (): void => {
    logoutUser();
    setUser(null);
    setInitializationError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        initializationError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
