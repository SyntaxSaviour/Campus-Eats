import { useState, useEffect } from "react";
import type { User, Restaurant } from "@shared/schema";
import { getStoredAuth, setStoredAuth, clearStoredAuth } from "@/lib/auth";

interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    restaurant: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = getStoredAuth();
    setAuth({
      ...stored,
      isLoading: false,
    });
  }, []);

  const login = (user: User, restaurant?: Restaurant) => {
    const newAuth = {
      user,
      restaurant: restaurant || null,
      isAuthenticated: true,
      isLoading: false,
    };
    setAuth(newAuth);
    setStoredAuth(newAuth);
  };

  const logout = () => {
    const newAuth = {
      user: null,
      restaurant: null,
      isAuthenticated: false,
      isLoading: false,
    };
    setAuth(newAuth);
    clearStoredAuth();
  };

  return {
    ...auth,
    login,
    logout,
  };
}
