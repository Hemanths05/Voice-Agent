/**
 * SuperAdmin Analytics Page - Detailed analytics and charts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { superAdminAPI } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AnalyticsPage() {
  const { data: callsByStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ["analytics-calls-by-status"],
    queryFn: () => superAdminAPI.getCallsByStatus(),
  });

  const { data: callsByDay, isLoading: loadingDays } = useQuery({
    queryKey: ["analytics-calls-by-day"],
    queryFn: () => superAdminAPI.getCallsByDay(30),
  });

  return (
    <ProtectedRoute requiredRole="superadmin">
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Detailed insights and trends across the platform
            </p>
          </div>

          {/* Charts */}
          <div className="grid gap-6">
            {/* Calls by Day - Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Calls Over Time</CardTitle>
                <CardDescription>Daily call volume for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDays ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={callsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Calls"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Calls by Status - Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Calls by Status</CardTitle>
                  <CardDescription>Distribution of call statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStatus ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={callsByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Calls by Status - Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Call status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStatus ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={callsByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {callsByStatus?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Empty state for more charts */}
            <Card>
              <CardHeader>
                <CardTitle>More Analytics Coming Soon</CardTitle>
                <CardDescription>
                  Additional analytics and insights will be available here
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[200px]">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Revenue trends, user growth, and more</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
