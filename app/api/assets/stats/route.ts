import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { transformStatisticsFromDotNet } from "@/lib/api-transform";
import { handleApiError } from "@/lib/server/errors";

export async function GET() {
  try {
    // Call .NET API statistics endpoint
    const stats = await apiClient.get<{
      totalAssets: number;
      activeAssets: number;
      assetsWithTags: number;
      assetsWithoutTags: number;
      assetsNotSeen30Days: number;
      assetsNotSeen90Days: number;
      totalGates: number;
      activeGates: number;
      totalReaders: number;
      onlineReaders: number;
      totalMovementsLast24Hours: number;
    }>("/reports/statistics");

    // Get decommissioned assets count by querying with includeDeleted
    let decommissionedCount = 0;
    try {
      const { headers } = await apiClient.getWithHeaders<Array<{
        id: number;
        isDeleted: boolean;
      }>>("/assets", {
        pageNumber: 1,
        pageSize: 1, // We only need the count from header
        includeDeleted: true,
      });

      // Get total count including deleted
      const totalWithDeleted = Number(headers.get("X-Total-Count") || 0);
      // Decommissioned = total (including deleted) - active assets
      decommissionedCount = Math.max(0, totalWithDeleted - stats.activeAssets);
    } catch (error) {
      // If fetching decommissioned fails, fall back to calculation
      console.warn("Failed to fetch decommissioned count, using calculation", error);
      decommissionedCount = Math.max(0, stats.totalAssets - stats.activeAssets);
    }

    // Transform to frontend format
    const transformed = transformStatisticsFromDotNet(stats);
    
    // Override decommissioned count with actual value
    transformed.decommissionStats.totalDecommissioned = decommissionedCount;

    return NextResponse.json(transformed);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to fetch asset stats", error);
    return handleApiError(error);
  }
}
