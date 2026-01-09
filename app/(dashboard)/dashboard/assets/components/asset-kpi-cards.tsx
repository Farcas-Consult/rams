 "use client";

import { IconPackage } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAssetStats } from "../hooks/useAssets";
import { Skeleton } from "@/components/ui/skeleton";

export function AssetKPICards() {
  const { data: stats, isLoading } = useAssetStats();

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6">
        <Card className="@container/card">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32 mt-2" />
            <Skeleton className="h-6 w-20 mt-2" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { totalAssets = 0 } = stats || {};

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Assets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalAssets.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage className="size-3" />
              All Assets
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total assets in system <IconPackage className="size-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

