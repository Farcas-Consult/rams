import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { handleApiError } from "@/lib/server/errors";

/**
 * Placeholder routes for Gates API
 * UI implementation is skipped for now as per plan
 */

export async function GET(request: NextRequest) {
  try {
    const gates = await apiClient.get("/gates");
    return NextResponse.json(gates);
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

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const gate = await apiClient.post("/gates", payload);
    return NextResponse.json(gate, { status: 201 });
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

