import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  transformAssetFromDotNet,
  transformAssetToDotNetUpdate,
} from "@/lib/api-transform";
import { updateAssetSchema } from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";
import { handleApiError } from "@/lib/server/errors";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Call .NET API
    const dotNetAsset = await apiClient.get<{
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
    }>(`/assets/${id}`);

    // Transform response
    const transformedAsset = transformAssetFromDotNet(dotNetAsset);

    return NextResponse.json(transformedAsset);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to fetch asset", error);
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await request.json();
    
    // Validate payload
    const parsed = updateAssetSchema.safeParse({ ...payload, id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid asset payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Transform frontend format to .NET API format
    const dotNetPayload = transformAssetToDotNetUpdate(payload);

    // Call .NET API (uses PUT method)
    const dotNetAsset = await apiClient.put<{
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
    }>(`/assets/${id}`, dotNetPayload);

    // Transform response
    const transformedAsset = transformAssetFromDotNet(dotNetAsset);

    return NextResponse.json(transformedAsset);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to update asset", error);
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Call .NET API (soft delete)
    await apiClient.delete(`/assets/${id}`);

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to delete asset", error);
    return handleApiError(error);
  }
}
