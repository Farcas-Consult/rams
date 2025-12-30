import { NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { z } from "zod";
import { handleApiError } from "@/lib/server/errors";

const inboundEventSchema = z.object({
  epc: z.string().min(1, "epc is required"),
  timestamp: z.union([z.string(), z.number(), z.date()]).optional(),
  readerId: z.string().optional(),
  antenna: z.string().optional(),
  gate: z.string().optional(),
  direction: z.string().optional(),
  locationId: z.string().optional(),
});

export type InboundRfidEvent = z.infer<typeof inboundEventSchema>;

/**
 * POST /api/rfid-events
 * 
 * Note: The .NET API doesn't have a direct endpoint for receiving RFID events.
 * This endpoint is kept for compatibility but may need to be adapted based on
 * how the .NET API receives RFID events (possibly through MQTT or another mechanism).
 * 
 * For now, this endpoint will attempt to find the asset by tag and update its location.
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = inboundEventSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { epc, locationId } = parsed.data;

    // Try to find asset by tag identifier
    try {
      const asset = await apiClient.get<{
        id: number;
        tagIdentifier?: string;
        currentLocationId?: number;
      }>(`/assets/by-tag/${epc}`);

      // If locationId is provided and asset found, update location
      if (locationId && asset.currentLocationId !== Number(locationId)) {
        await apiClient.put(`/assets/${asset.id}`, {
          currentLocationId: Number(locationId),
        });
      }

      return NextResponse.json(
        {
          ok: true,
          assetId: String(asset.id),
          ...(locationId && { locationId }),
        },
        { status: 202 }
      );
    } catch (error) {
      // Asset not found by tag - this is okay, just return success
      // The .NET API might handle undiscovered tags differently
      if (error instanceof ApiError && error.status === 404) {
        return NextResponse.json(
          {
            ok: true,
            assetId: null,
            message: "Asset not found for this tag",
          },
          { status: 202 }
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    console.error("Failed to process RFID event", error);
    return handleApiError(error);
  }
}
