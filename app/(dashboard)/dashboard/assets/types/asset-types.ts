/**
 * Asset type definition
 * Based on .NET API AssetDto structure, with backward compatibility for frontend fields
 */
export type Asset = {
  id: string;
  plnt?: string;
  equipment?: string;
  material?: string;
  materialDescription?: string;
  techIdentNo?: string;
  assetTag?: string;
  assetName: string;
  name?: string; // .NET API field
  assetNumber?: string; // .NET API field
  category?: string;
  location?: string;
  status?: string;
  assignedTo?: string;
  purchaseDate?: Date | string;
  purchasePrice?: number;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  manufSerialNumber?: string;
  sysStatus?: string;
  userStatusRaw?: string;
  sLoc?: string;
  pfUserAc?: string;
  pfUserAccountableDescription?: string;
  pfPropMg?: string;
  pfPropMgmFocalPointDescription?: string;
  functionalLoc?: string;
  functionalLocDescription?: string;
  aGrp?: string;
  busA?: string;
  objectType?: string;
  costCtr?: string;
  acquistnValue?: number;
  comment?: string;
  discoveredAt?: Date | string;
  discoveryNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  origin?: string;
  discoveryStatus?: string;
  isDecommissioned?: boolean;
  decommissionedAt?: Date | string;
  decommissionReason?: string;
  // .NET API specific fields
  tagIdentifier?: string;
  rfidTags?: string[];
  currentLocationId?: number;
  currentLocationName?: string;
  lastDiscoveredAt?: Date | string;
  lastDiscoveredBy?: string;
  storageLocation?: string;
  costCenter?: string;
};

/**
 * Transformed asset type for table display
 */
export type TransformedAsset = Asset;

