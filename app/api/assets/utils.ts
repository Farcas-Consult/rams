import { asset, undiscoveredAsset } from "@/db/schema";
import type { AssetResponse } from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";

export type AssetRow = typeof asset.$inferSelect;
export type UndiscoveredRow = typeof undiscoveredAsset.$inferSelect;

export const serializeAsset = (row: AssetRow): AssetResponse => ({
  id: row.id,
  plnt: row.plnt ?? undefined,
  equipment: row.equipment ?? undefined,
  material: row.material ?? undefined,
  materialDescription: row.materialDescription ?? undefined,
  techIdentNo: row.techIdentNo ?? undefined,
  assetTag: row.assetTag ?? undefined,
  assetName: row.assetName,
  category: row.category ?? undefined,
  location: row.location ?? undefined,
  status: row.status ?? undefined,
  assignedTo: row.assignedTo ?? undefined,
  purchaseDate: row.purchaseDate ?? undefined,
  purchasePrice: row.purchasePrice ? Number(row.purchasePrice) : undefined,
  serialNumber: row.serialNumber ?? undefined,
  manufacturer: row.manufacturer ?? undefined,
  model: row.model ?? undefined,
  description: row.description ?? undefined,
  manufSerialNumber: row.manufSerialNumber ?? undefined,
  sysStatus: row.sysStatus ?? undefined,
  userStatusRaw: row.userStatusRaw ?? undefined,
  sLoc: row.sLoc ?? undefined,
  pfUserAc: row.pfUserAc ?? undefined,
  pfUserAccountableDescription: row.pfUserAccountableDescription ?? undefined,
  pfPropMg: row.pfPropMg ?? undefined,
  pfPropMgmFocalPointDescription: row.pfPropMgmFocalPointDescription ?? undefined,
  functionalLoc: row.functionalLoc ?? undefined,
  functionalLocDescription: row.functionalLocDescription ?? undefined,
  aGrp: row.aGrp ?? undefined,
  busA: row.busA ?? undefined,
  objectType: row.objectType ?? undefined,
  costCtr: row.costCtr ?? undefined,
  acquistnValue: row.acquistnValue ? Number(row.acquistnValue) : undefined,
  comment: row.comment ?? undefined,
  discoveredAt: row.discoveredAt ?? undefined,
  discoveryNotes: row.discoveryNotes ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  origin: row.origin ?? "inventory",
  discoveryStatus: row.discoveryStatus ?? "catalogued",
  isDecommissioned: row.isDecommissioned ?? false,
  decommissionedAt: row.decommissionedAt ?? undefined,
  decommissionReason: row.decommissionReason ?? undefined,
});

const getString = (payload: Record<string, unknown>, key: string) =>
  typeof payload[key] === "string" && payload[key] ? (payload[key] as string).trim() : undefined;

const getNumber = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const serializeUndiscoveredAsset = (row: UndiscoveredRow): AssetResponse => {
  const payload = row.payload ?? {};
  const equipment = getString(payload, "Equipment") ?? row.externalIdentifier ?? undefined;
  const materialDesc =
    getString(payload, "Material Description") ?? getString(payload, "Description") ?? undefined;

  return {
    id: row.id,
    plnt: getString(payload, "Plnt"),
    equipment,
    material: getString(payload, "Material"),
    materialDescription: materialDesc,
    techIdentNo: getString(payload, "TechIdentNo.") ?? getString(payload, "TechIdentNo"),
    assetTag: equipment,
    assetName: materialDesc ?? row.description ?? "Discovered Asset",
    category: getString(payload, "ObjectType") ?? getString(payload, "Material"),
    location:
      getString(payload, "Description of functional location") ??
      getString(payload, "Functional Loc.") ??
      row.location ??
      undefined,
    status: "Undiscovered",
    origin: "discovered",
    discoveryStatus: row.discoveryStatus,
    assignedTo: getString(payload, "PF User Accountable Description") ?? row.seenBy ?? undefined,
    purchaseDate: undefined,
    purchasePrice: undefined,
    serialNumber:
      getString(payload, "ManufSerialNumber") ??
      getString(payload, "TechIdentNo.") ??
      row.externalIdentifier ??
      undefined,
    manufacturer: undefined,
    model: undefined,
    description: getString(payload, "Description") ?? row.notes ?? undefined,
    manufSerialNumber: getString(payload, "ManufSerialNumber"),
    sysStatus: getString(payload, "SysStatus") ?? row.systemStatus ?? undefined,
    userStatusRaw: getString(payload, "UserStatus") ?? row.userStatus ?? undefined,
    sLoc: getString(payload, "SLoc"),
    pfUserAc: getString(payload, "PF User Ac"),
    pfUserAccountableDescription:
      getString(payload, "PF User Accountable Description") ?? row.seenBy ?? undefined,
    pfPropMg: getString(payload, "PF Prop.Mg"),
    pfPropMgmFocalPointDescription: getString(payload, "PF Prop.Mgm Focal Point Description"),
    functionalLoc: getString(payload, "Functional Loc."),
    functionalLocDescription: getString(payload, "Description of functional location"),
    aGrp: getString(payload, "AGrp"),
    busA: getString(payload, "BusA"),
    objectType: getString(payload, "ObjectType"),
    costCtr: getString(payload, "Cost Ctr"),
    acquistnValue: getNumber(payload, "AcquistnValue"),
    comment: getString(payload, "Comment"),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    isDecommissioned: false,
  };
};


