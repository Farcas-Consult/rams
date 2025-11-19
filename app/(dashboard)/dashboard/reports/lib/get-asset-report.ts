import { cache } from "react";

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

type RawReportRow = Record<string, string>;

type DatasetSource = {
  headers: string[];
  rows: RawReportRow[];
};

let datasetSource: DatasetSource | null = null;

const createColumnKey = (label: string, index: number) => {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || `column_${index + 1}`;
  return `${base}_${index}`;
};

export const primeAssetReportDataset = (source: DatasetSource) => {
  datasetSource = source;
};

export const getAssetReportDataset = cache((): AssetReportDataset => {
  if (!datasetSource) {
    throw new Error("Asset report dataset has not been initialized");
  }

  const columns: AssetReportColumn[] = datasetSource.headers.map((label, index) => ({
    key: createColumnKey(label, index),
    label,
  }));

  const rows: AssetReportRow[] = datasetSource.rows.map((row, rowIndex) => {
    const record: AssetReportRow = { id: `row-${rowIndex}` };
    columns.forEach(({ key, label }) => {
      record[key] = row[label] ?? "";
    });
    return record;
  });

  return { columns, rows };
});


