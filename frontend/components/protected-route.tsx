/**
 * Protected Route - Wrapper for routes that require authentication
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "superadmin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
      // Redirect to appropriate dashboard
      if (user?.role === "superadmin") {
        router.push("/superadmin");
      } else {
        router.push("/admin");
      }
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
