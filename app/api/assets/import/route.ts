import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { importAssetsSchema } from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = importAssetsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid import payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Transform assets to .NET API bulk-import format
    // The .NET API accepts all these fields according to BulkImportAssetDto
    const dotNetAssets = parsed.data.assets.map((asset) => {
      const result: Record<string, unknown> = {};
      
      // Required/mapped fields
      if (asset.equipment || asset.assetTag || asset.assetNumber) {
        result.equipment = asset.equipment || asset.assetTag || asset.assetNumber || "";
      }
      if (asset.assetName || asset.name || asset.description) {
        result.description = asset.assetName || asset.name || asset.description || "";
      }
      if (asset.materialDescription || asset.description) {
        result.materialDescription = asset.materialDescription || asset.description;
      }
      if (asset.material) {
        result.material = asset.material;
      }
      
      // Additional supported fields
      if (asset.manufSerialNumber) {
        result.manufSerialNumber = asset.manufSerialNumber;
      }
      if (asset.techIdentNo) {
        result.techIdentNo = asset.techIdentNo;
      }
      if (asset.plnt) {
        result.plnt = asset.plnt;
      }
      if (asset.sLoc) {
        result.sLoc = asset.sLoc;
      }
      if (asset.costCtr) {
        result.costCtr = asset.costCtr;
      }
      if (asset.aGrp) {
        result.aGrp = asset.aGrp;
      }
      if (asset.busA) {
        result.busA = asset.busA;
      }
      if (asset.objectType) {
        result.objectType = asset.objectType;
      }
      if (asset.sysStatus) {
        result.sysStatus = asset.sysStatus;
      }
      if (asset.userStatusRaw) {
        result.userStatus = asset.userStatusRaw;
      }
      if (asset.acquistnValue !== undefined && asset.acquistnValue !== null) {
        result.acquistnValue = asset.acquistnValue;
      }
      if (asset.comment) {
        result.comment = asset.comment;
      }
      
      // Extra optional fields
      if (asset.manufacturer) {
        result.manufacturer = asset.manufacturer;
      }
      if (asset.purchaseDate) {
        // Ensure purchaseDate is in ISO 8601 format
        // purchaseDate from schema is string, but handle Date if it somehow gets through
        const dateValue = typeof asset.purchaseDate === 'string' 
          ? asset.purchaseDate 
          : String(asset.purchaseDate);
        if (dateValue) {
          result.purchaseDate = dateValue;
        }
      }
      if (asset.category) {
        result.category = asset.category;
      }
      if (asset.location) {
        result.location = asset.location;
      }
      
      return result;
    });

    // Call .NET API bulk import
    const result = await apiClient.post<{
      success: boolean;
      totalRows: number;
      successCount: number;
      errorCount: number;
      errors: string[];
    }>("/assets/bulk-import", dotNetAssets);

    // Transform response to match frontend format
    return NextResponse.json({
      success: result.successCount,
      failed: result.errorCount,
      errors: result.errors,
      createdAssets: [], // .NET API doesn't return created asset IDs
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to import assets", error);
    return NextResponse.json(
      { error: "Failed to import assets" },
      { status: 500 }
    );
  }
}
