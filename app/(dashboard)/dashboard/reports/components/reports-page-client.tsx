"use client";

import { useAssetReports } from "../hooks/use-asset-reports";
import { ReportClient } from "./report-client";
import { IconLoader2 } from "@tabler/icons-react";
import { TaggingKPICards } from "../../assets/components/tagging-kpi-cards";

export function ReportsPageClient() {
  const { data: dataset, isLoading, error } = useAssetReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading asset reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h3 className="font-semibold text-destructive">Failed to load reports</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  if (!dataset || dataset.rows.length === 0) {
    return (
      <div className="rounded-lg border border-border/70 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">No asset reports available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaggingKPICards />
      <ReportClient columns={dataset.columns} rows={dataset.rows} />
    </div>
  );
}

