import { AssetDashboardKPIs } from "./components/asset-dashboard-kpis";
import { AssetRadialUptime } from "./components/asset-radial-uptime";
import { AssetTypePie } from "./components/asset-type-pie";
import { AssetLocationBars } from "./components/asset-location-bars";

export default async function Page() {
  return (
    <div className="space-y-6">
      <AssetDashboardKPIs />

      <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2 xl:grid-cols-3">
        <AssetRadialUptime />
        <AssetTypePie />
        <div className="lg:col-span-2 xl:col-span-1">
          <AssetLocationBars />
        </div>
      </div>
    </div>
  );
}
