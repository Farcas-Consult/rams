import { getDashboardData } from "@/lib/dashboard-data";

import { AssetDashboardKPIs } from "./components/asset-dashboard-kpis";
import { AssetLocationBars } from "./components/asset-location-bars";
import { TaggingKPICards } from "./assets/components/tagging-kpi-cards";

export default async function Page() {
  const dashboardData = await getDashboardData();

  return (
    <div className="space-y-6">
      <AssetDashboardKPIs data={dashboardData.kpis} />

      <TaggingKPICards />

      <div className="px-4 lg:px-6">
        <AssetLocationBars data={dashboardData.locationDistribution} />
      </div>
    </div>
  );
}
