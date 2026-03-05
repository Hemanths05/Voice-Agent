/**
 * Admin Calls Page - List and view all calls
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye } from "lucide-react";
import type { Call } from "@/lib/api/types";

export default function CallsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-calls", page, statusFilter],
    queryFn: () =>
      adminAPI.listCalls({
        page,
        page_size: 20,
        status_filter: statusFilter || undefined,
      }),
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      in_progress: "secondary",
      failed: "destructive",
      no_answer: "secondary",
      queued: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all your voice agent calls
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search calls..." className="pl-9" />
            </div>

            <select
              className="px-4 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="no_answer">No Answer</option>
            </select>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Calls ({data?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No calls found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.items.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-mono text-xs">
                          {call.call_sid.slice(0, 10)}...
                        </TableCell>
                        <TableCell>{call.from_number}</TableCell>
                        <TableCell>{call.to_number}</TableCell>
                        <TableCell>{getStatusBadge(call.status)}</TableCell>
                        <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                        <TableCell className="capitalize">{call.direction}</TableCell>
                        <TableCell>
                          {new Date(call.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCall(call)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {data.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call Detail Dialog */}
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Call Details</DialogTitle>
              <DialogDescription>
                Complete information about this call
              </DialogDescription>
            </DialogHeader>

            {selectedCall && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Call SID</p>
                    <p className="font-mono text-sm">{selectedCall.call_sid}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    {getStatusBadge(selectedCall.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">From</p>
                    <p>{selectedCall.from_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">To</p>
                    <p>{selectedCall.to_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p>{formatDuration(selectedCall.duration_seconds)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Direction</p>
                    <p className="capitalize">{selectedCall.direction}</p>
                  </div>
                </div>

                {selectedCall.transcript && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Transcript
                    </p>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm">{selectedCall.transcript}</p>
                    </div>
                  </div>
                )}

                {selectedCall.summary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm">{selectedCall.summary}</p>
                    </div>
                  </div>
                )}

                {selectedCall.sentiment && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sentiment</p>
                    <Badge>{selectedCall.sentiment}</Badge>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
