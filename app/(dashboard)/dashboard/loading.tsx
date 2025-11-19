import {
  DashboardChartsSkeleton,
  DashboardKPIsSkeleton,
} from "@/components/skeletons/dashboard-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <DashboardKPIsSkeleton />
      <DashboardChartsSkeleton />
    </div>
  );
}


