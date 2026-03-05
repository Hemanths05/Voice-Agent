/**
 * Authentication Store - Zustand store for auth state management
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../api/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Store tokens in localStorage for API client
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);
        }

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        // Clear tokens from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
      // Persist user, tokens, and auth status
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, also sync with localStorage tokens
        if (state && typeof window !== "undefined") {
          const accessToken = localStorage.getItem("access_token");
          const refreshToken = localStorage.getItem("refresh_token");

          // If tokens exist in localStorage but not in state, restore them
          if (accessToken && refreshToken && !state.accessToken) {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
          }
        }
      },
    }
  )
);
