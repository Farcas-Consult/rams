"use client";

import { useQuery } from "@tanstack/react-query";
import { reportHeaders, type ReportRow } from "../data/report-data";
import { mapAssetToReportRow } from "../lib/map-asset-to-report";
import { createAssetReportDataset, type AssetReportDataset } from "../lib/get-asset-report";
import type { Asset } from "@/db/schema";

const API_BASE_URL = "/api/reports/assets";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch asset reports");
  }
  return response.json();
};

const fetchAssetReports = async (): Promise<AssetReportDataset> => {
  const response = await fetch(API_BASE_URL, {
    cache: "no-store",
  });
  const data = await handleResponse<{ assets: Asset[] }>(response);

  // Map assets to report format
  const reportRows: ReportRow[] = data.assets.map(mapAssetToReportRow);

  // Create report dataset from mapped rows
  return createAssetReportDataset(reportHeaders, reportRows);
};

export const useAssetReports = () => {
  return useQuery({
    queryKey: ["asset-reports"],
    queryFn: fetchAssetReports,
    staleTime: 1000 * 60, // 1 minute
  });
};

