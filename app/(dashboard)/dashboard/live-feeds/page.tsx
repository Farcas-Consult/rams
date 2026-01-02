 "use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSignalRLiveFeed } from "@/lib/signalr-hook";

type LiveFeedRow = {
  assetId: string | null;
  lastSeenEpc: string | null;
  lastSeenAt: string;
  lastSeenReaderId: string | null;
  lastSeenGate: string | null;
  lastSeenDirection: string | null;
  assetName: string | null;
  equipment: string | null;
  assetTag: string | null;
  location: string | null;
  category: string | null;
  status: string | null;
};

type TimeWindow = "all" | "5m" | "15m" | "60m";

function useLiveFeed() {
  const queryClient = useQueryClient();
  
  return useQuery<LiveFeedRow[]>({
    queryKey: ["live-feed"],
    queryFn: async () => {
      const res = await fetch("/api/live-feed");
      if (!res.ok) {
        throw new Error("Failed to fetch live feed");
      }
      const newData = await res.json();
      
      // Merge with existing cache to preserve SignalR updates
      const oldData = queryClient.getQueryData<LiveFeedRow[]>(["live-feed"]);
      if (!oldData) return newData;
      
      // Create a map keyed by asset identifier + timestamp
      const dataMap = new Map<string, LiveFeedRow>();
      
      // First add all new API data
      newData.forEach((row: LiveFeedRow) => {
        const key = `${row.assetId ?? row.lastSeenEpc ?? row.equipment ?? 'unknown'}-${row.lastSeenAt}`;
        dataMap.set(key, row);
      });
      
      // Then merge in old data (from SignalR) if it's newer or missing
      oldData.forEach((oldRow: LiveFeedRow) => {
        const oldKey = `${oldRow.assetId ?? oldRow.lastSeenEpc ?? oldRow.equipment ?? 'unknown'}-${oldRow.lastSeenAt}`;
        const existing = dataMap.get(oldKey);
        
        if (!existing) {
          // Not in new data, check if it's recent (within last hour) before adding
          const oldTime = new Date(oldRow.lastSeenAt).getTime();
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          if (oldTime >= oneHourAgo) {
            dataMap.set(oldKey, oldRow);
          }
        } else {
          // Compare timestamps - keep the newer one
          const oldTime = new Date(oldRow.lastSeenAt).getTime();
          const newTime = new Date(existing.lastSeenAt).getTime();
          if (oldTime > newTime) {
            dataMap.set(oldKey, oldRow);
          }
        }
      });
      
      // Convert back to array, sort by timestamp, and limit
      const merged = Array.from(dataMap.values());
      merged.sort((a, b) => {
        const dateA = new Date(a.lastSeenAt).getTime();
        const dateB = new Date(b.lastSeenAt).getTime();
        return dateB - dateA;
      });
      
      return merged.slice(0, 500);
    },
    // Keep polling as fallback, but reduce frequency when SignalR is connected
    refetchInterval: 30000, // Poll every 30 seconds as fallback
    refetchOnWindowFocus: false,
  });
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  }

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  }

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

function filterByTimeWindow(rows: LiveFeedRow[], window: TimeWindow) {
  if (window === "all") return rows;
  const now = new Date().getTime();

  const minutes =
    window === "5m" ? 5 : window === "15m" ? 15 : window === "60m" ? 60 : 0;
  const threshold = now - minutes * 60 * 1000;

  return rows.filter((row) => {
    const ts = new Date(row.lastSeenAt).getTime();
    return ts >= threshold;
  });
}

const statusColorMap: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  inactive:
    "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200",
  decommissioned:
    "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export default function LiveFeedsPage() {
  const { data, isLoading, isError } = useLiveFeed();
  const { isConnected, error: signalRError } = useSignalRLiveFeed();

  const [gate, setGate] = React.useState<string>("all");
  const [category, setCategory] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");
  const [timeWindow, setTimeWindow] = React.useState<TimeWindow>("all");

  const rows = data ?? [];

  const uniqueGates = React.useMemo(
    () =>
      Array.from(
        new Set(rows.map((r) => r.lastSeenGate).filter(Boolean))
      ) as string[],
    [rows]
  );
  const uniqueCategories = React.useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[],
    [rows]
  );
  const uniqueStatuses = React.useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.status).filter(Boolean))) as string[],
    [rows]
  );

  const filteredRows = React.useMemo(() => {
    let next = filterByTimeWindow(rows, timeWindow);

    if (gate !== "all") {
      next = next.filter((r) => r.lastSeenGate === gate);
    }
    if (category !== "all") {
      next = next.filter((r) => r.category === category);
    }
    if (status !== "all") {
      next = next.filter((r) => r.status === status);
    }

    return next;
  }, [rows, gate, category, status, timeWindow]);

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Live Asset Feed
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Real-time RFID reads for tracked assets.
            </p>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isConnected
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
              )}
            >
              {isConnected ? "● Live" : "○ Polling"}
            </Badge>
            {signalRError && (
              <span className="text-xs text-red-600 dark:text-red-400">
                SignalR: {signalRError}
              </span>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pb-4 sm:flex-row sm:flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Gate
            </span>
            <Select value={gate} onValueChange={setGate}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="All gates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All gates</SelectItem>
                {uniqueGates.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Time window
            </span>
            <Select
              value={timeWindow}
              onValueChange={(v: TimeWindow) => setTimeWindow(v)}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="5m">Last 5 minutes</SelectItem>
                <SelectItem value="15m">Last 15 minutes</SelectItem>
                <SelectItem value="60m">Last 60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Category
            </span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {uniqueCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {uniqueStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">
            Live reads
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `Showing ${filteredRows.length} of ${rows.length} records`}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 px-4 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="px-4 py-8 text-sm text-red-600 dark:text-red-400">
              Failed to load live feed. Please try again.
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              No assets seen for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset name</TableHead>
                    <TableHead>Last seen</TableHead>
                    <TableHead>Gate</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={`${row.assetId ?? row.lastSeenEpc ?? row.equipment}-${row.lastSeenAt}`}>
                      <TableCell className="max-w-[180px] truncate">
                        {row.assetName ?? row.equipment ?? (row.assetId ? "-" : "Unknown Asset")}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(row.lastSeenAt)}
                        </span>
                      </TableCell>
                      <TableCell>{row.lastSeenGate ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {row.lastSeenDirection ?? "in"}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.location ?? "—"}</TableCell>
                      <TableCell>{row.category ?? "—"}</TableCell>
                      <TableCell>
                        {row.status ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-transparent text-xs font-medium",
                              statusColorMap[row.status.toLowerCase()] ??
                                "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                            )}
                          >
                            {row.status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">—</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


