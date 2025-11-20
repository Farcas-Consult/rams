// Note: primeAssetReportDataset is deprecated. Use createAssetReportDataset from lib/get-asset-report instead.
// This file now only exports reportHeaders and types.
// The hardcoded reportRows and initializeReportDataset are deprecated.
// Use the useAssetReports hook instead to fetch data from the database.

export const reportHeaders = [
  "Equip No.",
  "Contained in",
  "Description",
  "Loc. in UMOJA",
  "Description (RAMS)",
  "Loc. change in UMOJA",
  "Loc. in last inventory",
  "Description (Last Inventory)",
  "Last inventory by",
  "Last inventory",
  "Seen by",
  "Seen at",
  "Seen",
  "Seen by User",
  "Seen Operation",
  "Direction",
  "Latitude",
  "Longitude",
  "Tag count",
  "Material Num.",
  "Material Desc.",
  "Technical Num.",
  "Technical Desc.",
  "Manuf. s/n",
  "System status",
  "User status",
  "RAMS User status",
  "Storage Location",
  "PF User Acc.",
  "PF User Acc. Desc.",
  "Functional Loc.",
  "Functional Loc. Desc.",
  "License plate",
  "Mission",
  "Access Group",
  "Access Group Desc.",
  "Business Area",
  "Bus. Area Desc.",
  "Object Type",
  "Cost Centre",
  "Reporting Entity",
  "Acq. Value (USD)",
  "Asset Notes",
  "Last PV date",
  "Last PV by",
] as const;

export type ReportHeader = (typeof reportHeaders)[number];
export type ReportRow = Record<ReportHeader, string>;

