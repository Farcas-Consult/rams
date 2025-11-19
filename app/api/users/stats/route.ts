import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db, schema } from "@/db";
import { handleApiError } from "@/lib/server/errors";
import { requireUserWithPermission } from "@/lib/server/authz";

export async function GET(request: NextRequest) {
  try {
    await requireUserWithPermission("users:read", request.headers);

    const [statusCounts, roleCounts, newThisMonth, newLastMonth] =
      await Promise.all([
        db
          .select({
            status: schema.user.status,
            count: sql<number>`count(*)`,
          })
          .from(schema.user)
          .groupBy(schema.user.status),
        db
          .select({
            role: schema.user.role,
            count: sql<number>`count(*)`,
          })
          .from(schema.user)
          .groupBy(schema.user.role),
        countUsersForMonth("current"),
        countUsersForMonth("previous"),
      ]);

    const totalUsers = statusCounts.reduce(
      (sum, row) => sum + Number(row.count),
      0
    );

    const activeUsers = getCount(statusCounts, "active");
    const inactiveUsers = getCount(statusCounts, "inactive");
    const suspendedUsers = getCount(statusCounts, "suspended");
    const invitedUsers = getCount(statusCounts, "invited");
    const superAdmins = getCount(roleCounts, "superadmin");
    const admins = getCount(roleCounts, "admin");

    const growthRate = calculateGrowthRate(newThisMonth, newLastMonth);
    const activeRatio = totalUsers
      ? (activeUsers / totalUsers) * 100
      : 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      invitedUsers,
      superAdmins,
      admins,
      newThisMonth,
      growthRate,
      activeRatio,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function countUsersForMonth(window: "current" | "previous") {
  const modifier =
    window === "current" ? sql`` : sql` - interval '1 month'`;

  const [{ value }] = await db
    .select({
      value: sql<number>`
        count(*) 
        FILTER (
          WHERE date_trunc('month', ${schema.user.createdAt}) = date_trunc('month', now()${modifier})
        )
      `,
    })
    .from(schema.user);

  return Number(value ?? 0);
}

function getCount<T extends { count: unknown; role?: string; status?: string }>(
  rows: T[],
  key: string
) {
  const match = rows.find((row) => row.status === key || row.role === key);
  return match ? Number(match.count) : 0;
}

function calculateGrowthRate(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}


