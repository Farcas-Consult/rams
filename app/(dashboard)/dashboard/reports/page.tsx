import { ReportClient } from "./components/report-client";
import { getAssetReportDataset } from "./lib/get-asset-report";
import { initializeReportDataset } from "./data/report-data";

export default function ReportsPage() {
  initializeReportDataset();
  const dataset = getAssetReportDataset();

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Asset Reports</h1>
        <p className="text-muted-foreground">
          Filter the authoritative RAMS export, interrogate trends, and download the exact slice you need.
        </p>
      </div>

      <ReportClient columns={dataset.columns} rows={dataset.rows} />
    </div>
  );
}
