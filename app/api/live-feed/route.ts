import { NextResponse } from "next/server";

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
    .innerJoin(asset, (join) => join.on(asset.id.eq(assetPresence.assetId)))
    .orderBy(assetPresence.lastSeenAt.desc());

  return NextResponse.json(rows);
}


