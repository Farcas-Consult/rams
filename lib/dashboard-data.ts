import { apiClient } from "@/lib/api-client";
import { transformAssetFromDotNet } from "@/lib/api-transform";

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
  try {
    // Fetch all assets from .NET API (excluding deleted ones)
    const assets = await apiClient.get<Array<{
      id: number;
      assetNumber: string;
      name: string;
      status?: string;
      category?: string;
      currentLocationName?: string;
      location?: string;
      isDeleted: boolean;
    }>>("/assets", {
      pageNumber: 1,
      pageSize: 10000, // Get all assets for dashboard
      includeDeleted: false,
    });

    // Filter out deleted assets and transform
    const activeAssets = assets
      .filter((a) => !a.isDeleted)
      .map((a) => ({
        status: a.status || "",
        category: a.category || null,
        location: a.currentLocationName || a.location || null,
        isDecommissioned: a.isDeleted,
      }));

    const totalAssets = activeAssets.length;

    // Count by status
    const statusCounts = activeAssets.reduce((acc, asset) => {
      const status = normalizeStatus(asset.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assetsInService = Object.entries(statusCounts)
      .filter(([status]) => matchesKeyword(status, ACTIVE_KEYWORDS))
      .reduce((sum, [, count]) => sum + count, 0);

    const maintenanceAssets = Object.entries(statusCounts)
      .filter(([status]) => matchesKeyword(status, MAINTENANCE_KEYWORDS))
      .reduce((sum, [, count]) => sum + count, 0);

    const decommissionedAssets = activeAssets.filter((a) => a.isDecommissioned).length;
    const downtimeCount = Math.max(0, totalAssets - assetsInService);
    const uptimePct = totalAssets > 0 ? Math.round((assetsInService / totalAssets) * 100) : 0;

    // Count by category
    const categoryCounts = activeAssets.reduce((acc, asset) => {
      const category = asset.category || "Unspecified";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by location
    const locationCounts = activeAssets.reduce((acc, asset) => {
      const location = asset.location || "Unspecified";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
        Object.entries(categoryCounts).map(([label, count]) => ({ label, count })),
        5
      ),
      locationDistribution: buildDistribution(
        Object.entries(locationCounts).map(([label, count]) => ({ label, count })),
        6
      ),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    // Return empty data on error
    return {
      kpis: {
        totalAssets: 0,
        assetsInService: 0,
        maintenanceAssets: 0,
        decommissionedAssets: 0,
      },
      uptime: {
        activeCount: 0,
        downtimeCount: 0,
        uptimePct: 0,
      },
      typeDistribution: [],
      locationDistribution: [],
    };
  }
}
