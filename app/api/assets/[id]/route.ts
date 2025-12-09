import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { asset, rfidTag } from "@/db/schema";
import {
  updateAssetSchema,
} from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";
import { serializeAsset } from "../utils";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const record = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, id),
    });

    if (!record) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Fetch RFID tags for this asset
    const tags = await db
      .select({ epc: rfidTag.epc })
      .from(rfidTag)
      .where(eq(rfidTag.assetId, id));
    
    const rfidTags = tags.map((tag) => tag.epc);

    return NextResponse.json(serializeAsset(record, rfidTags));
  } catch (error) {
    console.error("Failed to fetch asset", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const parsed = updateAssetSchema.safeParse({ ...payload, id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid asset payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    let existing = (await db.select().from(asset).where(eq(asset.id, id)).limit(1))[0] ?? null;

    let targetId = id;

    if (!existing && parsed.data.equipment) {
      const fallback = (await db.select().from(asset).where(eq(asset.equipment, parsed.data.equipment!)).limit(1))[0] ?? null;
      if (fallback) {
        existing = fallback;
        targetId = fallback.id;
      }
    }

    if (!existing && parsed.data.assetTag) {
      const fallback = (await db.select().from(asset).where(eq(asset.assetTag, parsed.data.assetTag!)).limit(1))[0] ?? null;
      if (fallback) {
        existing = fallback;
        targetId = fallback.id;
      }
    }

    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const desiredStatus = parsed.data.status ?? existing.status;
    const explicitDecommission = parsed.data.isDecommissioned;
    const nextIsDecommissioned =
      typeof explicitDecommission === "boolean"
        ? explicitDecommission
        : desiredStatus === "Decommissioned"
          ? true
          : desiredStatus && desiredStatus !== "Decommissioned"
            ? false
            : existing.isDecommissioned;

    const updatedValues = {
      plnt: parsed.data.plnt ?? existing.plnt,
      equipment: parsed.data.equipment ?? existing.equipment,
      material: parsed.data.material ?? existing.material,
      materialDescription: parsed.data.materialDescription ?? existing.materialDescription,
      techIdentNo: parsed.data.techIdentNo ?? existing.techIdentNo,
      assetTag: parsed.data.assetTag ?? parsed.data.equipment ?? existing.assetTag,
      assetName: parsed.data.assetName ?? existing.assetName,
      category: parsed.data.category ?? existing.category,
      location: parsed.data.location ?? existing.location,
      status: desiredStatus,
      assignedTo: parsed.data.assignedTo ?? existing.assignedTo,
      purchaseDate: parsed.data.purchaseDate
        ? new Date(parsed.data.purchaseDate)
        : existing.purchaseDate,
      purchasePrice:
        typeof parsed.data.purchasePrice === "number"
          ? String(parsed.data.purchasePrice)
          : parsed.data.purchasePrice
            ? String(parsed.data.purchasePrice)
            : existing.purchasePrice,
      serialNumber: parsed.data.serialNumber ?? parsed.data.manufSerialNumber ?? existing.serialNumber,
      manufacturer: parsed.data.manufacturer ?? existing.manufacturer,
      model: parsed.data.model ?? existing.model,
      description: parsed.data.description ?? existing.description,
      manufSerialNumber: parsed.data.manufSerialNumber ?? existing.manufSerialNumber,
      sysStatus: parsed.data.sysStatus ?? existing.sysStatus,
      userStatusRaw: parsed.data.userStatusRaw ?? existing.userStatusRaw,
      sLoc: parsed.data.sLoc ?? existing.sLoc,
      pfUserAc: parsed.data.pfUserAc ?? existing.pfUserAc,
      pfUserAccountableDescription:
        parsed.data.pfUserAccountableDescription ?? existing.pfUserAccountableDescription,
      pfPropMg: parsed.data.pfPropMg ?? existing.pfPropMg,
      pfPropMgmFocalPointDescription:
        parsed.data.pfPropMgmFocalPointDescription ?? existing.pfPropMgmFocalPointDescription,
      functionalLoc: parsed.data.functionalLoc ?? existing.functionalLoc,
      functionalLocDescription:
        parsed.data.functionalLocDescription ?? existing.functionalLocDescription,
      aGrp: parsed.data.aGrp ?? existing.aGrp,
      busA: parsed.data.busA ?? existing.busA,
      objectType: parsed.data.objectType ?? existing.objectType,
      costCtr: parsed.data.costCtr ?? existing.costCtr,
      acquistnValue:
        typeof parsed.data.acquistnValue === "number"
          ? String(parsed.data.acquistnValue)
          : parsed.data.acquistnValue
            ? String(parsed.data.acquistnValue)
            : existing.acquistnValue,
      comment: parsed.data.comment ?? existing.comment,
      origin: (parsed.data.origin as "inventory" | "import" | "discovered") ?? existing.origin,
      discoveryStatus: (parsed.data.discoveryStatus as "catalogued" | "pending_review" | "undiscovered") ?? existing.discoveryStatus,
      discoveredAt: parsed.data.discoveredAt
        ? new Date(parsed.data.discoveredAt)
        : existing.discoveredAt,
      discoveryNotes: parsed.data.discoveryNotes ?? existing.discoveryNotes,
      isDecommissioned: nextIsDecommissioned,
      decommissionedAt: parsed.data.decommissionedAt
        ? new Date(parsed.data.decommissionedAt)
        : nextIsDecommissioned
          ? existing.decommissionedAt ?? new Date()
          : null,
      decommissionReason: parsed.data.decommissionReason ?? existing.decommissionReason,
      updatedAt: new Date(),
    };

    await db
      .update(asset)
      .set(updatedValues)
      .where(eq(asset.id, targetId));

    // Fetch RFID tags for the updated asset
    const tags = await db
      .select({ epc: rfidTag.epc })
      .from(rfidTag)
      .where(eq(rfidTag.assetId, targetId));
    
    const rfidTags = tags.map((tag) => tag.epc);

    return NextResponse.json(
      serializeAsset(
        {
          ...existing,
          ...updatedValues,
        },
        rfidTags
      )
    );
  } catch (error) {
    console.error("Failed to update asset", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await db.delete(asset).where(eq(asset.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete asset", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}


