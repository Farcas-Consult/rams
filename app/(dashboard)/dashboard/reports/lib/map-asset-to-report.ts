import type { Asset } from "@/app/(dashboard)/dashboard/assets/types/asset-types";
import type { ReportRow } from "../data/report-data";

/**
 * Maps a database asset record to the report row format
 * All values are converted to strings as required by the report format
 */
export function mapAssetToReportRow(asset: Asset): ReportRow {
  // Helper to convert values to strings, handling null/undefined
  const toString = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return String(value);
    if (value instanceof Date) return value.toISOString();
    return String(value);
  };

  // Helper to get numeric value as string
  // Handles both number (from .NET API) and string (from legacy DB) types
  const getNumericValue = (
    value1: string | number | null | undefined,
    value2: string | number | null | undefined
  ): string => {
    // Convert to string and trim if it's a string
    const val1 = typeof value1 === "number" 
      ? String(value1) 
      : typeof value1 === "string" 
        ? value1.trim() 
        : "";
    const val2 = typeof value2 === "number" 
      ? String(value2) 
      : typeof value2 === "string" 
        ? value2.trim() 
        : "";
    
    if (val1 && val1 !== "") return val1;
    if (val2 && val2 !== "") return val2;
    return "";
  };

  return {
    "Equip No.": toString(asset.equipment),
    "Contained in": "", // Not in database schema
    Description: toString(asset.assetName || asset.description),
    "Loc. in UMOJA": toString(asset.functionalLoc || asset.location),
    "Description (RAMS)": toString(asset.functionalLocDescription || asset.location),
    "Loc. change in UMOJA": "", // Not in database schema
    "Loc. in last inventory": "", // Not in database schema
    "Description (Last Inventory)": toString(asset.location),
    "Last inventory by": "", // Not in database schema
    "Last inventory": "", // Not in database schema
    "Seen by": "", // Not in database schema - leave empty as per requirements
    "Seen at": "", // Not in database schema - leave empty as per requirements
    Seen: "", // Not in database schema - leave empty as per requirements
    "Seen by User": "", // Not in database schema - leave empty as per requirements
    "Seen Operation": "", // Not in database schema - leave empty as per requirements
    Direction: "", // Not in database schema - leave empty as per requirements
    Latitude: "", // Not in database schema - leave empty as per requirements
    Longitude: "", // Not in database schema - leave empty as per requirements
    "Tag count": "", // Not in database schema - leave empty as per requirements
    "Material Num.": toString(asset.material),
    "Material Desc.": toString(asset.materialDescription),
    "Technical Num.": toString(asset.techIdentNo),
    "Technical Desc.": toString(asset.description),
    "Manuf. s/n": toString(asset.manufSerialNumber),
    "System status": toString(asset.sysStatus),
    "User status": toString(asset.userStatusRaw),
    "RAMS User status": "", // Not in database schema - leave empty
    "Storage Location": toString(asset.sLoc),
    "PF User Acc.": toString(asset.pfUserAc),
    "PF User Acc. Desc.": toString(asset.pfUserAccountableDescription),
    "Functional Loc.": toString(asset.functionalLoc),
    "Functional Loc. Desc.": toString(asset.functionalLocDescription),
    "License plate": "", // Not in database schema - leave empty as per requirements
    Mission: "", // Not in database schema - leave empty as per requirements
    "Access Group": toString(asset.aGrp),
    "Access Group Desc.": "", // Not in database schema - leave empty as per requirements
    "Business Area": toString(asset.busA),
    "Bus. Area Desc.": "", // Not in database schema - leave empty as per requirements
    "Object Type": toString(asset.objectType),
    "Cost Centre": toString(asset.costCtr),
    "Reporting Entity": "", // Not in database schema - leave empty as per requirements
    "Acq. Value (USD)": getNumericValue(
      asset.acquistnValue,
      asset.purchasePrice
    ),
    "Asset Notes": toString(asset.comment),
    "Last PV date": "", // Not in database schema - leave empty as per requirements
    "Last PV by": "", // Not in database schema - leave empty as per requirements
  };
}

