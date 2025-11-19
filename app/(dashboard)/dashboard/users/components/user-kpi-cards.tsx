"use client";

import { IconTrendingUp, IconTrendingDown, IconUsers, IconMail, IconMailCheck, IconUserPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStats } from "../hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";

export function UserKPICards() {
  const { data: stats, isLoading } = useUserStats();

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
    totalUsers = 0,
    verifiedUsers = 0,
    unverifiedUsers = 0,
    newThisMonth = 0,
    growthRate = 0,
  } = stats || {};

  const isPositiveGrowth = growthRate >= 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isPositiveGrowth ? (
                <IconTrendingUp className="size-3" />
              ) : (
                <IconTrendingDown className="size-3" />
              )}
              {Math.abs(growthRate).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPositiveGrowth ? (
              <>
                Growing user base <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                User base declining <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            All registered users in the system
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Verified Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {verifiedUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              <IconMailCheck className="size-3" />
              {totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Email verified accounts <IconMailCheck className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {unverifiedUsers} pending verification
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {newThisMonth}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUserPlus className="size-3" />
              New
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Recent signups <IconUserPlus className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Users registered this month
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Unverified Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {unverifiedUsers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
              <IconMail className="size-3" />
              Pending
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Awaiting verification <IconMail className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Require email verification
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

