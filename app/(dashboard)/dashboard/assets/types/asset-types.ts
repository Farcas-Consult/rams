/**
 * Asset type definition
 * Based on common asset management fields - adjust based on your Excel structure
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
};

/**
 * Transformed asset type for table display
 */
export type TransformedAsset = Asset;

