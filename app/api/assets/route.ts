import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  transformAssetFromDotNet,
  transformPaginatedResponse,
  transformAssetToDotNetCreate,
} from "@/lib/api-transform";
import { assetQuerySchema } from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObject = {
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "10"),
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
    };

    const parsedQuery = assetQuerySchema.safeParse(queryObject);
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const { page, pageSize, search, category, status, location } = parsedQuery.data;

    // Build query params for .NET API
    const dotNetParams: Record<string, unknown> = {
      pageNumber: page,
      pageSize: pageSize,
    };

    // Map search to name or assetNumber filter
    if (search) {
      dotNetParams.name = search;
      // Also try assetNumber if name doesn't work well
      // The .NET API might support both, but we'll use name for now
    }

    // Map other filters
    if (category) {
      // .NET API doesn't have category filter, might need to filter client-side
      // For now, we'll skip it
    }

    if (status) {
      // .NET API doesn't have status filter directly
      // We might need to filter client-side or use isDeleted for Decommissioned
      if (status === "Decommissioned") {
        dotNetParams.includeDeleted = true;
      }
    }

    if (location) {
      // .NET API has currentLocationId, but we have location name
      // We might need to get location ID first or filter client-side
    }

    // Call .NET API with headers support for pagination
    const { data: dotNetAssets, headers } = await apiClient.getWithHeaders<Array<{
      id: number;
      assetNumber: string;
      name: string;
      description?: string;
      materialId?: string;
      serialNumber?: string;
      technicalId?: string;
      plant?: string;
      storageLocation?: string;
      costCenter?: string;
      assetGroup?: string;
      businessArea?: string;
      objectType?: string;
      systemStatus?: string;
      userStatus?: string;
      acquisitionValue?: number;
      comments?: string;
      tagIdentifier?: string;
      lastDiscoveredAt?: string;
      lastDiscoveredBy?: string;
      currentLocationId?: number;
      currentLocationName?: string;
      createdAt: string;
      updatedAt?: string;
      isDeleted: boolean;
    }>>("/assets", dotNetParams);

    // Get total count from response header (X-Total-Count)
    const totalCountHeader = headers.get("X-Total-Count");
    const total = totalCountHeader ? Number(totalCountHeader) : dotNetAssets.length;

    // Transform assets
    const transformedAssets = dotNetAssets.map(transformAssetFromDotNet);

    // Apply client-side filtering if needed (for fields not supported by .NET API)
    let filteredAssets = transformedAssets;
    if (category) {
      filteredAssets = filteredAssets.filter((a) => a.category === category);
    }
    if (status && status !== "Decommissioned") {
      filteredAssets = filteredAssets.filter((a) => a.status === status);
    }
    if (location) {
      filteredAssets = filteredAssets.filter(
        (a) => a.location === location || a.currentLocationName === location
      );
    }

    // Apply pagination (since .NET API might not handle all filters)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);
    const actualTotal = filteredAssets.length;

    const response = transformPaginatedResponse(
      paginatedAssets,
      actualTotal,
      page,
      pageSize
    );

    return NextResponse.json({
      ...response,
      undiscoveredAssets: [], // .NET API doesn't have undiscovered assets concept
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to fetch assets", error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Transform frontend format to .NET API format
    const dotNetPayload = transformAssetToDotNetCreate(payload);

    // Validate required fields
    if (!dotNetPayload.assetNumber || !dotNetPayload.name) {
      return NextResponse.json(
        { error: "assetNumber and name are required" },
        { status: 400 }
      );
    }

    // Call .NET API
    const dotNetAsset = await apiClient.post<{
      id: number;
      assetNumber: string;
      name: string;
      description?: string;
      materialId?: string;
      serialNumber?: string;
      technicalId?: string;
      plant?: string;
      storageLocation?: string;
      costCenter?: string;
      assetGroup?: string;
      businessArea?: string;
      objectType?: string;
      systemStatus?: string;
      userStatus?: string;
      acquisitionValue?: number;
      comments?: string;
      tagIdentifier?: string;
      lastDiscoveredAt?: string;
      lastDiscoveredBy?: string;
      currentLocationId?: number;
      currentLocationName?: string;
      createdAt: string;
      updatedAt?: string;
      isDeleted: boolean;
    }>("/assets", dotNetPayload);

    // Transform response
    const transformedAsset = transformAssetFromDotNet(dotNetAsset);

    return NextResponse.json(transformedAsset, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to create asset", error);
    return handleApiError(error);
  }
}
