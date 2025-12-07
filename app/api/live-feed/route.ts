import { NextResponse } from "next/server";
import { eq, desc, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { asset, assetPresence, readerEvent } from "@/db/schema";

export async function GET() {
  // Query 1: Known assets from assetPresence
  const knownAssets = await db
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
    .innerJoin(asset, eq(asset.id, assetPresence.assetId));

  // Query 2: Undiscovered EPCs - get latest readerEvent per EPC where assetId is null
  // Using raw SQL for DISTINCT ON which is PostgreSQL specific
  const undiscoveredEventsRaw = await db.execute(sql`
    SELECT DISTINCT ON (epc)
      NULL::text as "assetId",
      epc as "lastSeenEpc",
      seen_at as "lastSeenAt",
      reader_id as "lastSeenReaderId",
      gate as "lastSeenGate",
      COALESCE(direction, 'in') as "lastSeenDirection",
      NULL::text as "assetName",
      NULL::text as "equipment",
      NULL::text as "assetTag",
      NULL::text as "location",
      NULL::text as "category",
      NULL::text as "status"
    FROM reader_event
    WHERE asset_id IS NULL
    ORDER BY epc, seen_at DESC
  `);

  const undiscoveredEvents = (undiscoveredEventsRaw.rows as any[]).map((row: any) => ({
    assetId: row.assetId ?? null,
    lastSeenEpc: row.lastSeenEpc ?? null,
    lastSeenAt: row.lastSeenAt instanceof Date 
      ? row.lastSeenAt.toISOString() 
      : typeof row.lastSeenAt === 'string' 
        ? row.lastSeenAt 
        : new Date(row.lastSeenAt).toISOString(),
    lastSeenReaderId: row.lastSeenReaderId ?? null,
    lastSeenGate: row.lastSeenGate ?? null,
    lastSeenDirection: row.lastSeenDirection ?? "in",
    assetName: row.assetName ?? null,
    equipment: row.equipment ?? null,
    assetTag: row.assetTag ?? null,
    location: row.location ?? null,
    category: row.category ?? null,
    status: row.status ?? null,
  }));

  // Combine and sort by lastSeenAt descending
  const allRows = [
    ...knownAssets.map((row) => ({
      ...row,
      assetId: row.assetId,
      lastSeenAt: row.lastSeenAt instanceof Date 
        ? row.lastSeenAt.toISOString() 
        : typeof row.lastSeenAt === 'string'
          ? row.lastSeenAt
          : new Date(row.lastSeenAt).toISOString(),
      lastSeenDirection: row.lastSeenDirection ?? "in",
    })),
    ...undiscoveredEvents,
  ];

  // Sort by lastSeenAt descending
  allRows.sort((a, b) => {
    const dateA = new Date(a.lastSeenAt).getTime();
    const dateB = new Date(b.lastSeenAt).getTime();
    return dateB - dateA;
  });

  return NextResponse.json(allRows);
}


