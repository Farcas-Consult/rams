import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { asset, undiscoveredAsset } from "@/db/schema";

export async function GET() {
  try {
    // Filter to exclude decommissioned assets from main stats
    const notDecommissioned = eq(asset.isDecommissioned, false);

    const [totals, statusCounts, categoryCount, locationCount, undiscoveredCount, decommissionedRows] =
      await Promise.all([
        db.select({ total: sql<number>`count(*)` }).from(asset).where(notDecommissioned),
        db
          .select({ status: asset.status, count: sql<number>`count(*)` })
          .from(asset)
          .where(notDecommissioned)
          .groupBy(asset.status),
        db
          .select({ count: sql<number>`count(distinct ${asset.category})` })
          .from(asset)
          .where(notDecommissioned),
        db
          .select({ count: sql<number>`count(distinct ${asset.location})` })
          .from(asset)
          .where(notDecommissioned),
        db
          .select({ count: sql<number>`count(*)` })
          .from(undiscoveredAsset)
          .where(eq(undiscoveredAsset.discoveryStatus, "undiscovered")),
        db
          .select({
            id: asset.id,
            status: asset.status,
            createdAt: asset.createdAt,
            decommissionedAt: asset.decommissionedAt,
            decommissionReason: asset.decommissionReason,
          })
          .from(asset)
          .where(eq(asset.isDecommissioned, true)),
      ]);

    const totalAssets = Number(totals[0]?.total ?? 0);
    const totalValueResult = await db
      .select({
        value: sql<number>`coalesce(sum(coalesce(${asset.purchasePrice}, ${asset.acquistnValue})), 0)`,
      })
      .from(asset)
      .where(notDecommissioned);
    const totalValue = Number(totalValueResult[0]?.value ?? 0);

    const statusLookup = statusCounts.reduce<Record<string, number>>((acc, item) => {
      if (!item.status) return acc;
      acc[item.status] = Number(item.count ?? 0);
      return acc;
    }, {});

    const activeAssets = statusLookup["Active"] ?? 0;
    const maintenanceAssets = statusLookup["Maintenance"] ?? 0;

    const totalDecommissioned = decommissionedRows.length;

    const readyForRecommission = decommissionedRows.filter((record) => {
      const status = record.status?.toLowerCase() ?? "";
      const reason = record.decommissionReason?.toLowerCase() ?? "";
      return (
        status.includes("ready") ||
        status.includes("recommission") ||
        reason.includes("ready") ||
        reason.includes("recommission")
      );
    }).length;

    let pendingDisposal = decommissionedRows.filter((record) => {
      const status = record.status?.toLowerCase() ?? "";
      const reason = record.decommissionReason?.toLowerCase() ?? "";
      return status.includes("disposal") || reason.includes("disposal");
    }).length;

    if (pendingDisposal === 0) {
      pendingDisposal = Math.max(0, totalDecommissioned - readyForRecommission);
    }

    const downtimeSamples = decommissionedRows.filter(
      (record) => record.decommissionedAt instanceof Date
    );

    const averageDowntimeDays =
      downtimeSamples.length > 0
        ? Math.round(
            downtimeSamples.reduce((sumValue, record) => {
              if (!record.decommissionedAt) {
                return sumValue;
              }
              const start =
                record.createdAt?.getTime() ?? record.decommissionedAt.getTime();
              const end = record.decommissionedAt.getTime();
              return sumValue + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
            }, 0) / downtimeSamples.length
          )
        : 0;

    const assetStats = {
      totalAssets,
      activeAssets,
      maintenanceAssets,
      totalValue,
      categoriesCount: Number(categoryCount[0]?.count ?? 0),
      locationsCount: Number(locationCount[0]?.count ?? 0),
      undiscoveredAssets: Number(undiscoveredCount[0]?.count ?? 0),
    };

    const decommissionStats = {
      totalDecommissioned,
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


