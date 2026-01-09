import { NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api-client";
import { handleApiError } from "@/lib/server/errors";

type DotNetStatisticsResponse = {
  totalAssets: number;
  activeAssets: number;
  decommissionedAssets: number;
  assetsWithTags: number;
  assetsWithoutTags: number;
  assetsNotSeen30Days: number;
  assetsNotSeen90Days: number;
  totalGates: number;
  activeGates: number;
  totalReaders: number;
  onlineReaders: number;
  totalMovementsLast24Hours: number;
};

export async function GET() {
  try {
    const stats = await apiClient.get<DotNetStatisticsResponse>(
      "/reports/statistics"
    );

    const tagged = stats.assetsWithTags ?? 0;
    const untagged = stats.assetsWithoutTags ?? 0;
    const computedTotal = tagged + untagged;
    const total =
      typeof stats.totalAssets === "number" && stats.totalAssets > 0
        ? stats.totalAssets
        : computedTotal;

    const safeTotal = total > 0 ? total : 0;

    const taggedPct =
      safeTotal > 0 ? Math.round((tagged / safeTotal) * 100) : 0;
    const untaggedPct =
      safeTotal > 0 ? Math.round((untagged / safeTotal) * 100) : 0;

    return NextResponse.json({
      tagged,
      untagged,
      total: safeTotal,
      taggedPct,
      untaggedPct,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    return handleApiError(error);
  }
}

