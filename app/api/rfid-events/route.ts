import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { assetPresence, readerEvent, rfidTag } from "@/db/schema";

const inboundEventSchema = z.object({
  epc: z.string().min(1, "epc is required"),
  timestamp: z.union([z.string(), z.number(), z.date()]).optional(),
  readerId: z.string().optional(),
  antenna: z.string().optional(),
  gate: z.string().optional(),
  direction: z.string().optional(),
});

export type InboundRfidEvent = z.infer<typeof inboundEventSchema>;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = inboundEventSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { epc, timestamp, readerId, antenna, gate, direction } = parsed.data;

    const seenAt =
      timestamp instanceof Date
        ? timestamp
        : timestamp
          ? new Date(timestamp)
          : new Date();

    // 1) Resolve EPC -> asset
    const tag = await db.query.rfidTag.findFirst({
      where: (t, { eq }) => eq(t.epc, epc),
    });

    const assetId = tag?.assetId ?? null;

    // 2) Store raw reader event
    const id = crypto.randomUUID();

    await db.insert(readerEvent).values({
      id,
      epc,
      readerId,
      antenna,
      gate,
      direction,
      seenAt,
      assetId,
      createdAt: new Date(),
    });

    // 3) Update presence if we know the asset
    if (assetId) {
      await db
        .insert(assetPresence)
        .values({
          assetId,
          lastSeenEpc: epc,
          lastSeenAt: seenAt,
          lastSeenReaderId: readerId,
          lastSeenGate: gate,
          lastSeenDirection: direction,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: assetPresence.assetId,
          set: {
            lastSeenEpc: epc,
            lastSeenAt: seenAt,
            lastSeenReaderId: readerId,
            lastSeenGate: gate,
            lastSeenDirection: direction,
            updatedAt: new Date(),
          },
        });
    }

    return NextResponse.json(
      {
        ok: true,
        assetId,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process RFID event" },
      { status: 500 }
    );
  }
}


