import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { importAssetsSchema } from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";
import { transformAssetToDotNetCreate } from "@/lib/api-transform";

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

    // Transform assets to .NET API format
    // The .NET API expects an array with fields: equipment, description, materialDescription, material, plant, costCtr
    const dotNetAssets = parsed.data.assets.map((asset) => ({
      equipment: asset.equipment || asset.assetTag || asset.assetNumber || "",
      description: asset.assetName || asset.name || asset.description || "",
      materialDescription: asset.materialDescription || asset.description,
      material: asset.material,
      plant: asset.plnt, // Use plnt from frontend type
      costCtr: asset.costCtr, // Use costCtr from frontend type
    }));

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
