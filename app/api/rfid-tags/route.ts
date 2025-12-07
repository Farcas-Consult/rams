import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { rfidTag } from "@/db/schema";

const assignTagSchema = z.object({
  epc: z.string().min(1, "EPC is required"),
  assetId: z.string().min(1, "Asset ID is required"),
  position: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = assignTagSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { epc, assetId, position } = parsed.data;

    // Check if EPC is already assigned to an asset
    const existingTag = await db.query.rfidTag.findFirst({
      where: (t, { eq }) => eq(t.epc, epc),
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "EPC is already assigned to an asset", assetId: existingTag.assetId },
        { status: 409 }
      );
    }

    // Verify asset exists
    const asset = await db.query.asset.findFirst({
      where: (a, { eq }) => eq(a.id, assetId),
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    // Create RFID tag assignment
    const tagId = randomUUID();
    await db.insert(rfidTag).values({
      id: tagId,
      epc,
      assetId,
      position: position ?? null,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        id: tagId,
        epc,
        assetId,
        position: position ?? null,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to assign RFID tag", error);
    return NextResponse.json(
      { error: "Failed to assign RFID tag" },
      { status: 500 }
    );
  }
}

