"use client";

import { useQuery } from "@tanstack/react-query";
import { superAdminAPI } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, PhoneCall, CheckCircle, Activity, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent?: string;
}

function MetricCard({ title, value, sub, icon, accent = "bg-primary/10 text-primary" }: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-xl p-2 ${accent}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["superadmin-analytics"],
    queryFn: () => superAdminAPI.getAnalytics(),
  });

  return (
    <ProtectedRoute requiredRole="superadmin">
      <DashboardLayout>
        <div className="p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Platform-wide overview
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[80px]" />
                    <Skeleton className="h-3 w-[140px] mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  title="Total Companies"
                  value={analytics?.total_companies || 0}
                  sub={`${analytics?.active_companies || 0} active`}
                  icon={<Building2 className="h-4 w-4" />}
                  accent="bg-primary/10 text-primary"
                />
                <MetricCard
                  title="Active Companies"
                  value={analytics?.active_companies || 0}
                  sub={`${analytics?.suspended_companies || 0} suspended`}
                  icon={<CheckCircle className="h-4 w-4" />}
                  accent="bg-green-100 text-green-600"
                />
                <MetricCard
                  title="Total Users"
                  value={analytics?.total_users || 0}
                  sub="Across all companies"
                  icon={<Users className="h-4 w-4" />}
                  accent="bg-blue-100 text-blue-600"
                />
                <MetricCard
                  title="Total Calls"
                  value={analytics?.total_calls_all_companies || 0}
                  sub="Across all companies"
                  icon={<PhoneCall className="h-4 w-4" />}
                  accent="bg-violet-100 text-violet-600"
                />
                <MetricCard
                  title="Active Calls"
                  value={analytics?.active_calls_all_companies || 0}
                  sub="Currently in progress"
                  icon={<Activity className="h-4 w-4" />}
                  accent="bg-amber-100 text-amber-600"
                />
                <MetricCard
                  title="Total Revenue"
                  value={`$${(analytics?.total_subscriptions_revenue || 0).toLocaleString()}`}
                  sub="From subscriptions"
                  icon={<TrendingUp className="h-4 w-4" />}
                  accent="bg-emerald-100 text-emerald-600"
                />
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Quick Actions
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { href: "/superadmin/companies", icon: <Building2 className="h-5 w-5" />, label: "Manage Companies", desc: "View and edit companies" },
                    { href: "/superadmin/users", icon: <Users className="h-5 w-5" />, label: "Manage Users", desc: "View and manage all users" },
                    { href: "/superadmin/analytics", icon: <TrendingUp className="h-5 w-5" />, label: "View Analytics", desc: "Detailed platform stats" },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 text-primary p-2 group-hover:bg-primary/15 transition-colors">
                          {action.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
