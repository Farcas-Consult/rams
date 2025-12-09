import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { asset, rfidTag } from "@/db/schema";
import { requireRequestUser } from "@/lib/server/authz";
import { handleApiError } from "@/lib/server/errors";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const associateTagSchema = z.object({
  rfidTag: z.string().min(1, "rfidTag is required"),
  locationId: z.string().optional(),
});

// GET /api/assets/:id/rfid-tags
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireRequestUser(_request.headers);

    const { id } = await params;

    // Verify asset exists
    const assetRecord = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, id),
    });

    if (!assetRecord) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Fetch RFID tags for this asset
    const tags = await db
      .select({ epc: rfidTag.epc })
      .from(rfidTag)
      .where(eq(rfidTag.assetId, id));

    const rfidTags = tags.map((tag) => tag.epc);

    return NextResponse.json({ rfidTags });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/assets/:id/rfid-tags
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireRequestUser(request.headers);

    const { id } = await params;
    const payload = await request.json();
    const parsed = associateTagSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { rfidTag: epc, locationId } = parsed.data;

    // Verify asset exists
    const assetRecord = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, id),
    });

    if (!assetRecord) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Check if tag is already associated with another asset
    const existingTag = await db.query.rfidTag.findFirst({
      where: (tags, { eq }) => eq(tags.epc, epc),
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "RFID tag is already associated with another asset" },
        { status: 409 }
      );
    }

    // Create the association
    const tagId = randomUUID();
    await db.insert(rfidTag).values({
      id: tagId,
      epc,
      assetId: id,
      createdAt: new Date(),
    });

    // Update asset location if locationId is provided
    if (locationId) {
      await db
        .update(asset)
        .set({
          location: locationId,
          updatedAt: new Date(),
        })
        .where(eq(asset.id, id));
    }

    return NextResponse.json(
      {
        rfidTag: epc,
        ...(locationId && { locationId }),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/assets/:id/rfid-tags
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireRequestUser(_request.headers);

    const { id } = await params;

    // Verify asset exists
    const assetRecord = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, id),
    });

    if (!assetRecord) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Get all tags before deletion
    const tags = await db
      .select({ epc: rfidTag.epc })
      .from(rfidTag)
      .where(eq(rfidTag.assetId, id));

    const removedTags = tags.map((tag) => tag.epc);

    // Delete all tags for this asset
    await db.delete(rfidTag).where(eq(rfidTag.assetId, id));

    return NextResponse.json({ removed: removedTags }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

