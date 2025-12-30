import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { transformMovementToLiveFeed } from "@/lib/api-transform";
import { handleApiError } from "@/lib/server/errors";

export async function GET() {
  try {
    // Get movements from last 24 hours
    const fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - 24);
    const toDate = new Date();

    // Call .NET API movements endpoint
    const movements = await apiClient.get<Array<{
      id: number;
      assetId: number;
      assetNumber?: string;
      assetName?: string;
      fromLocationId?: number;
      fromLocationName?: string;
      toLocationId: number;
      toLocationName?: string;
      gateId?: number;
      gateName?: string;
      readerId?: number;
      readerName?: string;
      readerIdString?: string;
      readTimestamp: string;
    }>>("/movements", {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      pageNumber: 1,
      pageSize: 100, // Get recent movements
    });

    // Transform to live feed format
    const liveFeedData = movements.map(transformMovementToLiveFeed);

    // Sort by lastSeenAt descending
    liveFeedData.sort((a, b) => {
      const dateA = new Date(a.lastSeenAt).getTime();
      const dateB = new Date(b.lastSeenAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(liveFeedData);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to fetch live feed", error);
    return handleApiError(error);
  }
}
