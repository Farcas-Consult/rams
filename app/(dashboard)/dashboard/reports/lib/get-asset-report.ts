import { ReportHeader, type ReportRow } from "../data/report-data";

export type AssetReportColumn = {
  key: string;
  label: string;
};

export type AssetReportRow = {
  id: string;
} & Record<string, string>;

export type AssetReportDataset = {
  columns: AssetReportColumn[];
  rows: AssetReportRow[];
};

const createColumnKey = (label: string, index: number) => {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || `column_${index + 1}`;
  return `${base}_${index}`;
};

/**
 * Transforms report rows (mapped from database assets) into the report dataset format
 * used by the ReportClient component
 */
export function createAssetReportDataset(
  headers: readonly ReportHeader[],
  rows: ReportRow[]
): AssetReportDataset {
  const columns: AssetReportColumn[] = headers.map((label, index) => ({
    key: createColumnKey(label, index),
    label,
  }));

  const assetReportRows: AssetReportRow[] = rows.map((row, rowIndex) => {
    const record: AssetReportRow = { id: `row-${rowIndex}` };
    columns.forEach(({ key, label }) => {
      record[key] = row[label as ReportHeader] ?? "";
    });
    return record;
  });

  return { columns, rows: assetReportRows };
}

// Deprecated: Kept for backward compatibility, but should not be used
// Use createAssetReportDataset instead
export const primeAssetReportDataset = (_source: {
  headers: string[];
  rows: Record<string, string>[];
}) => {
  console.warn(
    "primeAssetReportDataset is deprecated. Use createAssetReportDataset instead."
  );
};

// Deprecated: Kept for backward compatibility, but should not be used
export const getAssetReportDataset = () => {
  throw new Error(
    "getAssetReportDataset is deprecated. Use createAssetReportDataset instead."
  );
};


