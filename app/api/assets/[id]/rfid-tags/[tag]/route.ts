import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { asset, rfidTag } from "@/db/schema";
import { requireRequestUser } from "@/lib/server/authz";
import { handleApiError } from "@/lib/server/errors";

type RouteParams = {
  params: Promise<{
    id: string;
    tag: string;
  }>;
};

// DELETE /api/assets/:id/rfid-tags/:tag
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireRequestUser(_request.headers);

    const { id, tag } = await params;
    
    // URL decode the tag parameter
    const decodedTag = decodeURIComponent(tag);

    // Verify asset exists
    const assetRecord = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, id),
    });

    if (!assetRecord) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Find the specific tag
    const existingTag = await db.query.rfidTag.findFirst({
      where: (tags, { eq, and }) => and(eq(tags.assetId, id), eq(tags.epc, decodedTag)),
    });

    if (!existingTag) {
      // According to spec: "Deleting a tag that isn't there can return 404 or 204 (either is fine)"
      // We'll return 404 for clarity
      return NextResponse.json({ error: "RFID tag not found" }, { status: 404 });
    }

    // Delete the tag
    await db
      .delete(rfidTag)
      .where(and(eq(rfidTag.assetId, id), eq(rfidTag.epc, decodedTag)));

    // Return 204 No Content (or 200 with removed tag as per spec)
    return NextResponse.json({ removed: decodedTag }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

