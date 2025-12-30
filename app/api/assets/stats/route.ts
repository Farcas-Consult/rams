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

    // Transform to frontend format
    const transformed = transformStatisticsFromDotNet(stats);

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
