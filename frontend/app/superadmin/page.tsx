/**
 * SuperAdmin Dashboard - Overview and analytics
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { superAdminAPI } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, PhoneCall, CheckCircle, Activity, TrendingUp } from "lucide-react";

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["superadmin-analytics"],
    queryFn: () => superAdminAPI.getAnalytics(),
  });

  return (
    <ProtectedRoute requiredRole="superadmin">
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Overview of your Voice Agent Platform
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[80px]" />
                    <Skeleton className="h-3 w-[140px] mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Companies */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Companies
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_companies || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.active_companies || 0} active companies
                  </p>
                </CardContent>
              </Card>

              {/* Active Companies */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Companies
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.active_companies || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.suspended_companies || 0} suspended
                  </p>
                </CardContent>
              </Card>

              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all companies
                  </p>
                </CardContent>
              </Card>

              {/* Total Calls */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Calls
                  </CardTitle>
                  <PhoneCall className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.total_calls_all_companies || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all companies
                  </p>
                </CardContent>
              </Card>

              {/* Active Calls */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Calls
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.active_calls_all_companies || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently in progress
                  </p>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.total_subscriptions_revenue?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From subscriptions
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage companies, users, and view detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <a
                  href="/superadmin/companies"
                  className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">Manage Companies</span>
                </a>
                <a
                  href="/superadmin/users"
                  className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Manage Users</span>
                </a>
                <a
                  href="/superadmin/analytics"
                  className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">View Analytics</span>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
