import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { asset } from "@/db/schema";

const ACTIVE_KEYWORDS = ["active", "operational", "in service", "running", "online"];
const MAINTENANCE_KEYWORDS = [
  "maintenance",
  "repair",
  "service",
  "servicing",
  "downtime",
  "inspection",
  "offline",
];

export type DashboardKPIData = {
  totalAssets: number;
  assetsInService: number;
  maintenanceAssets: number;
  decommissionedAssets: number;
};

export type DashboardUptimeData = {
  activeCount: number;
  downtimeCount: number;
  uptimePct: number;
};

export type DashboardChartSlice = {
  label: string;
  value: number;
};

export type DashboardData = {
  kpis: DashboardKPIData;
  uptime: DashboardUptimeData;
  typeDistribution: DashboardChartSlice[];
  locationDistribution: DashboardChartSlice[];
};

const normalizeStatus = (value?: string | null) => value?.toLowerCase().trim() ?? "";

const matchesKeyword = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

const buildDistribution = (
  rows: { label?: string | null; count: number }[],
  topN: number
): DashboardChartSlice[] => {
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, topN);
  const remainder = sorted.slice(topN);
  const otherTotal = remainder.reduce((sum, row) => sum + row.count, 0);

  const result = top.map((row) => ({
    label: row.label?.trim() || "Unspecified",
    value: row.count,
  }));

  if (otherTotal > 0) {
    result.push({ label: "Other", value: otherTotal });
  }

  return result;
};

export async function getDashboardData(): Promise<DashboardData> {
  const activeAssetsFilter = eq(asset.isDecommissioned, false);

  const [totalRows, statusRows, decommissionedRows, categoryRows, locationRows] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(asset).where(activeAssetsFilter),
      db
        .select({
          status: asset.status,
          count: sql<number>`count(*)`,
        })
        .from(asset)
        .where(activeAssetsFilter)
        .groupBy(asset.status),
      db.select({ count: sql<number>`count(*)` }).from(asset).where(eq(asset.isDecommissioned, true)),
      db
        .select({
          label: asset.category,
          count: sql<number>`count(*)`,
        })
        .from(asset)
        .where(activeAssetsFilter)
        .groupBy(asset.category),
      db
        .select({
          label: asset.location,
          count: sql<number>`count(*)`,
        })
        .from(asset)
        .where(activeAssetsFilter)
        .groupBy(asset.location),
    ]);

  const totalAssets = Number(totalRows[0]?.count ?? 0);
  const statusCounts = statusRows.map((row) => ({
    status: normalizeStatus(row.status),
    count: Number(row.count ?? 0),
  }));

  const assetsInService = statusCounts
    .filter((row) => matchesKeyword(row.status, ACTIVE_KEYWORDS))
    .reduce((sum, row) => sum + row.count, 0);

  const maintenanceAssets = statusCounts
    .filter((row) => matchesKeyword(row.status, MAINTENANCE_KEYWORDS))
    .reduce((sum, row) => sum + row.count, 0);

  const decommissionedAssets = Number(decommissionedRows[0]?.count ?? 0);
  const downtimeCount = Math.max(0, totalAssets - assetsInService);
  const uptimePct = totalAssets > 0 ? Math.round((assetsInService / totalAssets) * 100) : 0;

  return {
    kpis: {
      totalAssets,
      assetsInService,
      maintenanceAssets,
      decommissionedAssets,
    },
    uptime: {
      activeCount: assetsInService,
      downtimeCount,
      uptimePct,
    },
    typeDistribution: buildDistribution(
      categoryRows.map((row) => ({
        label: row.label,
        count: Number(row.count ?? 0),
      })),
      5
    ),
    locationDistribution: buildDistribution(
      locationRows.map((row) => ({
        label: row.label,
        count: Number(row.count ?? 0),
      })),
      6
    ),
  };
}


