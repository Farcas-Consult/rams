"use client";

import {
  Trash2,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDecommissionStats } from "../hooks/useAssets";
import { Skeleton } from "@/components/ui/skeleton";

export function DecommissionKPICards() {
  const { data: stats, isLoading } = useDecommissionStats();

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
              <Skeleton className="h-6 w-20 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalDecommissioned = 0,
    readyForRecommission = 0,
    pendingDisposal = 0,
    averageDowntimeDays = 0,
  } = stats || {};

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Decommissioned</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalDecommissioned}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 dark:text-red-400">
              <Trash2 className="size-3" />
              Offline
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Assets removed from service <Trash2 className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Review and decide next steps
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ready for Recommission</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {readyForRecommission}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              <RefreshCw className="size-3" />
              Available
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Suitable for redeployment <RefreshCw className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Awaiting allocation
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Disposal</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingDisposal}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="size-3" />
              Attention
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Requires disposal workflow <AlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Ensure compliance and documentation
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg. Downtime</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageDowntimeDays}d
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Clock className="size-3" />
              Days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Average time offline <Clock className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Helps prioritize redeployment efforts
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

