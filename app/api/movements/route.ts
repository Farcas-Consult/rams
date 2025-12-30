import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { handleApiError } from "@/lib/server/errors";

/**
 * Placeholder routes for Movements API
 * UI implementation is skipped for now as per plan
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, unknown> = {};

    if (searchParams.get("fromDate")) {
      params.fromDate = searchParams.get("fromDate");
    }
    if (searchParams.get("toDate")) {
      params.toDate = searchParams.get("toDate");
    }
    if (searchParams.get("assetId")) {
      params.assetId = Number(searchParams.get("assetId"));
    }
    if (searchParams.get("gateId")) {
      params.gateId = Number(searchParams.get("gateId"));
    }
    if (searchParams.get("pageNumber")) {
      params.pageNumber = Number(searchParams.get("pageNumber"));
    }
    if (searchParams.get("pageSize")) {
      params.pageSize = Number(searchParams.get("pageSize"));
    }

    const movements = await apiClient.get("/movements", params);
    return NextResponse.json(movements);
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

