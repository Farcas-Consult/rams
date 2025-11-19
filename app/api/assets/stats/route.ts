import { NextResponse } from "next/server";
import { eq, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { asset, undiscoveredAsset } from "@/db/schema";

export async function GET() {
  try {
    const [totals, statusCounts, categoryCount, locationCount, undiscoveredCount, decommissioned] =
      await Promise.all([
        db.select({ total: sql<number>`count(*)` }).from(asset),
        db
          .select({ status: asset.status, count: sql<number>`count(*)` })
          .from(asset)
          .groupBy(asset.status),
        db.select({ count: sql<number>`count(distinct ${asset.category})` }).from(asset),
        db.select({ count: sql<number>`count(distinct ${asset.location})` }).from(asset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(undiscoveredAsset)
          .where(eq(undiscoveredAsset.discoveryStatus, "undiscovered")),
        db
          .select({
            createdAt: asset.createdAt,
            decommissionedAt: asset.decommissionedAt,
            isDecommissioned: asset.isDecommissioned,
          })
          .from(asset)
          .where(eq(asset.status, "Decommissioned")),
      ]);

    const totalAssets = Number(totals[0]?.total ?? 0);
    const totalValueResult = await db
      .select({ value: sum(asset.acquistnValue) })
      .from(asset);
    const totalValue = Number(totalValueResult[0]?.value ?? 0);

    const statusLookup = statusCounts.reduce<Record<string, number>>((acc, item) => {
      if (!item.status) return acc;
      acc[item.status] = Number(item.count ?? 0);
      return acc;
    }, {});

    const activeAssets = statusLookup["Active"] ?? 0;
    const maintenanceAssets = statusLookup["Maintenance"] ?? 0;
    const decommissionedAssets = statusLookup["Decommissioned"] ?? 0;

    const averageDowntimeDays =
      decommissioned.length > 0
        ? Math.round(
            decommissioned.reduce((sumValue, record) => {
              if (!record.decommissionedAt) return sumValue;
              const start = record.createdAt?.getTime() ?? record.decommissionedAt.getTime();
              const end = record.decommissionedAt.getTime();
              return sumValue + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
            }, 0) / decommissioned.length
          )
        : 0;

    const assetStats = {
      totalAssets,
      activeAssets,
      maintenanceAssets,
      decommissionedAssets,
      totalValue,
      categoriesCount: Number(categoryCount[0]?.count ?? 0),
      locationsCount: Number(locationCount[0]?.count ?? 0),
      undiscoveredAssets: Number(undiscoveredCount[0]?.count ?? 0),
    };

    const pendingDisposal = Math.round(decommissionedAssets * 0.3);
    const readyForRecommission = decommissionedAssets - pendingDisposal;

    const decommissionStats = {
      totalDecommissioned: decommissionedAssets,
      readyForRecommission: Math.max(0, readyForRecommission),
      pendingDisposal: Math.max(0, pendingDisposal),
      averageDowntimeDays,
    };

    return NextResponse.json({
      assetStats,
      decommissionStats,
    });
  } catch (error) {
    console.error("Failed to fetch asset stats", error);
    return NextResponse.json(
      { error: "Failed to fetch asset stats" },
      { status: 500 }
    );
  }
}


