import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  transformAssetFromDotNet,
  type DotNetAssetDto,
} from "@/lib/api-transform";
import { handleApiError } from "@/lib/server/errors";
import { z } from "zod";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const assignTagSchema = z.object({
  tagIdentifier: z.string().min(1, "tagIdentifier is required"),
});

// GET /api/assets/:id/rfid-tags
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get asset from .NET API
    const dotNetAsset = await apiClient.get<{
      id: number;
      tagIdentifier?: string;
    }>(`/assets/${id}`);

    // Extract tagIdentifier
    const rfidTags = dotNetAsset.tagIdentifier ? [dotNetAsset.tagIdentifier] : [];

    return NextResponse.json({ rfidTags });
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
    return handleApiError(error);
  }
}

// POST /api/assets/:id/rfid-tags
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const parsed = assignTagSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { tagIdentifier } = parsed.data;

    // Call .NET API to assign tag
    // According to API docs, this returns a full AssetDto
    const dotNetAsset = await apiClient.post<DotNetAssetDto>(
      `/assets/${id}/assign-tag`,
      { tagIdentifier }
    );

    // Transform response
    const transformedAsset = transformAssetFromDotNet(dotNetAsset);

    return NextResponse.json(
      {
        rfidTag: transformedAsset.tagIdentifier,
      },
      { status: 201 }
    );
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
    return handleApiError(error);
  }
}

// DELETE /api/assets/:id/rfid-tags
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get asset first to get tagIdentifier
    const dotNetAsset = await apiClient.get<{
      id: number;
      tagIdentifier?: string;
    }>(`/assets/${id}`);

    const removedTag = dotNetAsset.tagIdentifier;

    // Call .NET API to unassign tag
    await apiClient.post(`/assets/${id}/unassign-tag`);

    return NextResponse.json({ removed: removedTag ? [removedTag] : [] }, { status: 200 });
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
    return handleApiError(error);
  }
}
