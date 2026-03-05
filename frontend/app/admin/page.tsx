/**
 * Admin Dashboard - Overview and metrics for company admin
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneCall, CheckCircle, XCircle, Clock, BookOpen, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminAPI.getDashboard(),
  });

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Overview of your voice agent activity
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
            <>
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Calls */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.total_calls || 0}</div>
                    <p className="text-xs text-muted-foreground">All time calls</p>
                  </CardContent>
                </Card>

                {/* Active Calls */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.active_calls || 0}</div>
                    <p className="text-xs text-muted-foreground">Currently in progress</p>
                  </CardContent>
                </Card>

                {/* Completed Calls */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.completed_calls || 0}</div>
                    <p className="text-xs text-muted-foreground">Successfully finished</p>
                  </CardContent>
                </Card>

                {/* Failed Calls */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.failed_calls || 0}</div>
                    <p className="text-xs text-muted-foreground">Unsuccessful attempts</p>
                  </CardContent>
                </Card>

                {/* Avg Duration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(metrics?.avg_call_duration_seconds || 0)}s
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((metrics?.total_duration_minutes || 0))} min total
                    </p>
                  </CardContent>
                </Card>

                {/* Knowledge Base */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.knowledge_docs_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metrics?.knowledge_chunks_count || 0} chunks indexed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Manage your voice agent calls and knowledge base
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <a
                      href="/admin/calls"
                      className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <PhoneCall className="h-5 w-5" />
                      <span className="font-medium">View Calls</span>
                    </a>
                    <a
                      href="/admin/knowledge"
                      className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Manage Knowledge</span>
                    </a>
                    <a
                      href="/admin/agent"
                      className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Configure Agent</span>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
