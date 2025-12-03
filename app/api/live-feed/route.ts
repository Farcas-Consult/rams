import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { asset, assetPresence } from "@/db/schema";

export async function GET() {
  const rows = await db
    .select({
      assetId: assetPresence.assetId,
      lastSeenEpc: assetPresence.lastSeenEpc,
      lastSeenAt: assetPresence.lastSeenAt,
      lastSeenReaderId: assetPresence.lastSeenReaderId,
      lastSeenGate: assetPresence.lastSeenGate,
      lastSeenDirection: assetPresence.lastSeenDirection,
      assetName: asset.assetName,
      equipment: asset.equipment,
      assetTag: asset.assetTag,
      location: asset.location,
      category: asset.category,
      status: asset.status,
    })
    .from(assetPresence)
    .innerJoin(asset, eq(asset.id, assetPresence.assetId))
    .orderBy(desc(assetPresence.lastSeenAt));

  return NextResponse.json(rows);
}


