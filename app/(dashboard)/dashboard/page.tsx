import { getDashboardData } from "@/lib/dashboard-data";

import { AssetDashboardKPIs } from "./components/asset-dashboard-kpis";
import { AssetRadialUptime } from "./components/asset-radial-uptime";
import { AssetTypePie } from "./components/asset-type-pie";
import { AssetLocationBars } from "./components/asset-location-bars";

export default async function Page() {
  const dashboardData = await getDashboardData();

  return (
    <div className="space-y-6">
      <AssetDashboardKPIs data={dashboardData.kpis} />

      <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2 xl:grid-cols-3">
        <AssetRadialUptime data={dashboardData.uptime} />
        <AssetTypePie data={dashboardData.typeDistribution} />
        <div className="lg:col-span-2 xl:col-span-1">
          <AssetLocationBars data={dashboardData.locationDistribution} />
        </div>
      </div>
    </div>
  );
}
