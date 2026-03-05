/**
 * useAuth Hook - Custom hook for authentication operations
 */

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import { authAPI } from "../api/endpoints";
import type { LoginRequest, RegisterRequest } from "../api/types";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authAPI.login(credentials);
      setAuth(response.user, response.tokens.access_token, response.tokens.refresh_token);

      // Redirect based on role
      if (response.user.role === "superadmin") {
        router.push("/superadmin");
      } else {
        router.push("/admin");
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authAPI.register(data);
      setAuth(response.user, response.tokens.access_token, response.tokens.refresh_token);

      // Redirect based on role
      if (response.user.role === "superadmin") {
        router.push("/superadmin");
      } else {
        router.push("/admin");
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  const refreshUserData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      useAuthStore.getState().updateUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData,
  };
}
