import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { transformAssetFromDotNet } from "@/lib/api-transform";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "location";

    if (reportType === "location") {
      // Get location report
      const locationId = searchParams.get("locationId");
      const plant = searchParams.get("plant");
      const costCenter = searchParams.get("costCenter");

      const params: Record<string, unknown> = {
        pageNumber: 1,
        pageSize: 1000, // Get all for reports
      };

      if (locationId) params.locationId = Number(locationId);
      if (plant) params.plant = plant;
      if (costCenter) params.costCenter = costCenter;

      const assets = await apiClient.get<Array<{
        id: number;
        assetNumber: string;
        name: string;
        description?: string;
        plant?: string;
        costCenter?: string;
        currentLocationId?: number;
        currentLocationName?: string;
        createdAt: string;
        isDeleted: boolean;
      }>>("/reports/location", params);

      const transformedAssets = assets
        .filter((a) => !a.isDeleted)
        .map(transformAssetFromDotNet);

      return NextResponse.json({ assets: transformedAssets });
    } else if (reportType === "discovery") {
      // Get discovery report
      const daysNotSeen = Number(searchParams.get("daysNotSeen") || "30");

      const assets = await apiClient.get<Array<{
        id: number;
        assetNumber: string;
        name: string;
        description?: string;
        lastDiscoveredAt?: string;
        createdAt: string;
        isDeleted: boolean;
      }>>("/reports/discovery", { daysNotSeen });

      const transformedAssets = assets
        .filter((a) => !a.isDeleted)
        .map(transformAssetFromDotNet);

      return NextResponse.json({ assets: transformedAssets });
    }

    return NextResponse.json(
      { error: "Invalid report type" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to fetch assets for reports", error);
    return handleApiError(error);
  }
}
