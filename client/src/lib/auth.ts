import type { User, Restaurant } from "@shared/schema";

export interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = "campuseats_auth";

export function getStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        restaurant: parsed.restaurant || null,
        isAuthenticated: !!parsed.user,
      };
    }
  } catch (error) {
    console.error("Error parsing stored auth:", error);
  }
  
  return {
    user: null,
    restaurant: null,
    isAuthenticated: false,
  };
}

export function setStoredAuth(auth: Partial<AuthState>) {
  try {
    const current = getStoredAuth();
    const updated = { ...current, ...auth };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error storing auth:", error);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing stored auth:", error);
  }
}
