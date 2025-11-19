import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { asset } from "@/db/schema";
import {
  updateAssetSchema,
} from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";
import { serializeAsset } from "../utils";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const record = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, params.id),
    });

    if (!record) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(serializeAsset(record));
  } catch (error) {
    console.error("Failed to fetch asset", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await request.json();
    const parsed = updateAssetSchema.safeParse({ ...payload, id: params.id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid asset payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existing = await db.query.asset.findFirst({
      where: (assets, { eq }) => eq(assets.id, params.id),
    });

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
          ? parsed.data.purchasePrice
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
          ? parsed.data.acquistnValue
          : existing.acquistnValue,
      comment: parsed.data.comment ?? existing.comment,
      origin: parsed.data.origin ?? existing.origin,
      discoveryStatus: parsed.data.discoveryStatus ?? existing.discoveryStatus,
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
      .where(eq(asset.id, params.id));

    return NextResponse.json(
      serializeAsset({
        ...existing,
        ...updatedValues,
      })
    );
  } catch (error) {
    console.error("Failed to update asset", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await db.delete(asset).where(eq(asset.id, params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete asset", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}


