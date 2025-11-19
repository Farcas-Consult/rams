"use client";

import {
  IconTrendingUp,
  IconTrendingDown,
  IconUserCheck,
  IconShieldOff,
  IconUserPlus,
} from "@tabler/icons-react";
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
        activeUsers = 0,
        inactiveUsers = 0,
        suspendedUsers = 0,
        invitedUsers = 0,
        superAdmins = 0,
        admins = 0,
        newThisMonth = 0,
        growthRate = 0,
        activeRatio = 0,
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
                {newThisMonth} new this month <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Flat growth <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            All registered accounts in RAMS
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              <IconUserCheck className="size-3" />
              {activeRatio.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {totalUsers - activeUsers} not active
          </div>
          <div className="text-muted-foreground">
            {inactiveUsers} inactive · {suspendedUsers} suspended
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Invites</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {invitedUsers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUserPlus className="size-3" />
              Awaiting signup
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Watch for expired invites
          </div>
          <div className="text-muted-foreground">
            Resend or revoke invitations as needed
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Privileged Seats</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(superAdmins + admins).toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShieldOff className="size-3" />
              {superAdmins} super · {admins} admin
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Monitor least-privilege access
          </div>
          <div className="text-muted-foreground">
            Promote/demote roles as responsibilities change
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

