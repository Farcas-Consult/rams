import { NextRequest, NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { asset } from "@/db/schema";
import { importAssetsSchema } from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = importAssetsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid import payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      createdAssets: [] as string[],
    };

    await db.transaction(async (tx) => {
      for (const [index, entry] of parsed.data.assets.entries()) {
        try {
          const now = new Date();

          console.info("Importing asset from CSV", {
            row: index + 1,
            equipment: entry.equipment,
            assetTag: entry.assetTag,
            raw: entry,
          });

          const conditions = [];
          if (entry.equipment) conditions.push(eq(asset.equipment, entry.equipment));
          if (entry.assetTag) conditions.push(eq(asset.assetTag, entry.assetTag));
          if (entry.serialNumber) conditions.push(eq(asset.serialNumber, entry.serialNumber));

          let existing = null;
          if (conditions.length > 0) {
            const whereClause =
              conditions.length === 1 ? conditions[0] : or(...conditions);
            const rows = await tx.select().from(asset).where(whereClause).limit(1);
            existing = rows[0] ?? null;
          }

          if (existing) {
            const updates = {
              plnt: entry.plnt ?? existing.plnt,
              equipment: entry.equipment ?? existing.equipment,
              material: entry.material ?? existing.material,
              materialDescription: entry.materialDescription ?? existing.materialDescription,
              techIdentNo: entry.techIdentNo ?? existing.techIdentNo,
              assetTag: entry.assetTag ?? existing.assetTag,
              assetName: entry.assetName ?? existing.assetName,
              category: entry.category ?? existing.category,
              location: entry.location ?? existing.location,
              status: entry.status ?? existing.status,
              assignedTo: entry.assignedTo ?? existing.assignedTo,
              purchaseDate: entry.purchaseDate
                ? new Date(entry.purchaseDate)
                : existing.purchaseDate,
              purchasePrice:
                typeof entry.purchasePrice === "number"
                  ? entry.purchasePrice
                  : existing.purchasePrice,
              manufacturer: entry.manufacturer ?? existing.manufacturer,
              model: entry.model ?? existing.model,
              description: entry.description ?? existing.description,
              manufSerialNumber: entry.manufSerialNumber ?? existing.manufSerialNumber,
              sysStatus: entry.sysStatus ?? existing.sysStatus,
              userStatusRaw: entry.userStatusRaw ?? existing.userStatusRaw,
              sLoc: entry.sLoc ?? existing.sLoc,
              pfUserAc: entry.pfUserAc ?? existing.pfUserAc,
              pfUserAccountableDescription:
                entry.pfUserAccountableDescription ?? existing.pfUserAccountableDescription,
              pfPropMg: entry.pfPropMg ?? existing.pfPropMg,
              pfPropMgmFocalPointDescription:
                entry.pfPropMgmFocalPointDescription ?? existing.pfPropMgmFocalPointDescription,
              functionalLoc: entry.functionalLoc ?? existing.functionalLoc,
              functionalLocDescription:
                entry.functionalLocDescription ?? existing.functionalLocDescription,
              aGrp: entry.aGrp ?? existing.aGrp,
              busA: entry.busA ?? existing.busA,
              objectType: entry.objectType ?? existing.objectType,
              costCtr: entry.costCtr ?? existing.costCtr,
              acquistnValue:
                typeof entry.acquistnValue === "number"
                  ? entry.acquistnValue
                  : existing.acquistnValue,
              comment: entry.comment ?? existing.comment,
            };

            const hasChanges = Object.entries(updates).some(
              ([key, value]) => value !== (existing as any)[key]
            );

            if (hasChanges) {
              await tx
                .update(asset)
                .set({ ...updates, updatedAt: now })
                .where(eq(asset.id, existing.id));
            }

            results.success += 1;
            results.createdAssets.push(existing.id);
          } else {
            const newId = randomUUID();
            await tx.insert(asset).values({
              id: newId,
              plnt: entry.plnt ?? null,
              equipment: entry.equipment ?? entry.assetTag ?? null,
              material: entry.material ?? null,
              materialDescription: entry.materialDescription ?? null,
              techIdentNo: entry.techIdentNo ?? null,
              assetTag: entry.assetTag ?? entry.equipment ?? null,
              assetName: entry.assetName ?? entry.materialDescription ?? "Imported Asset",
              category: entry.category ?? null,
              location: entry.location ?? null,
              status: entry.status ?? "Active",
              assignedTo: entry.assignedTo ?? null,
              purchaseDate: entry.purchaseDate ? new Date(entry.purchaseDate) : null,
              purchasePrice: entry.purchasePrice ?? entry.acquistnValue ?? null,
              serialNumber: entry.serialNumber ?? entry.manufSerialNumber ?? null,
              manufacturer: entry.manufacturer ?? null,
              model: entry.model ?? null,
              description: entry.description ?? entry.materialDescription ?? null,
              origin: "import",
              manufSerialNumber: entry.manufSerialNumber ?? null,
              sysStatus: entry.sysStatus ?? null,
              userStatusRaw: entry.userStatusRaw ?? null,
              sLoc: entry.sLoc ?? null,
              pfUserAc: entry.pfUserAc ?? null,
              pfUserAccountableDescription: entry.pfUserAccountableDescription ?? null,
              pfPropMg: entry.pfPropMg ?? null,
              pfPropMgmFocalPointDescription: entry.pfPropMgmFocalPointDescription ?? null,
              functionalLoc: entry.functionalLoc ?? null,
              functionalLocDescription: entry.functionalLocDescription ?? null,
              aGrp: entry.aGrp ?? null,
              busA: entry.busA ?? null,
              objectType: entry.objectType ?? null,
              costCtr: entry.costCtr ?? null,
              acquistnValue: entry.acquistnValue ?? null,
              comment: entry.comment ?? null,
              discoveryStatus: entry.discoveryStatus ?? "catalogued",
              isDecommissioned: entry.status === "Decommissioned",
              decommissionedAt: entry.status === "Decommissioned" ? now : null,
              createdAt: now,
              updatedAt: now,
            });
            results.success += 1;
            results.createdAssets.push(newId);
          }
        } catch (error) {
          console.error("Failed to import asset", error);
          results.failed += 1;
          results.errors.push(`Row ${index + 1}: ${(error as Error).message}`);
        }
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to import assets", error);
    return NextResponse.json(
      { error: "Failed to import assets" },
      { status: 500 }
    );
  }
}


