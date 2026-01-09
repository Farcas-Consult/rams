"use client";

import { IconNfc, IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaggingStats } from "../hooks/useAssets";

export function TaggingKPICards() {
  const { data, isLoading } = useTaggingStats();

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2">
        {[1, 2].map((i) => (
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

  const tagged = data?.tagged ?? 0;
  const untagged = data?.untagged ?? 0;
  const taggedPct = data?.taggedPct ?? 0;
  const untaggedPct = data?.untaggedPct ?? 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2">
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Tagged Assets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {tagged.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1.5 text-emerald-600 dark:text-emerald-400">
              <IconNfc className="size-3" />
              {taggedPct}% tagged
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Assets with at least one RFID tag or identifier
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Untagged Assets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {untagged.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1.5 text-amber-600 dark:text-amber-400">
              <IconAlertTriangle className="size-3" />
              {untaggedPct}% untagged
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Assets that do not yet have an RFID tag assigned
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

