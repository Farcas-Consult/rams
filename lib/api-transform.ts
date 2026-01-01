/**
 * Data transformation utilities for converting between .NET API DTOs and frontend types
 */

// .NET API DTO types (based on API documentation)
export interface DotNetAssetDto {
  id: number;
  assetNumber: string;
  name: string;
  description?: string;
  materialId?: string;
  serialNumber?: string;
  technicalId?: string;
  plant?: string;
  storageLocation?: string;
  costCenter?: string;
  assetGroup?: string;
  businessArea?: string;
  objectType?: string;
  systemStatus?: string;
  userStatus?: string;
  acquisitionValue?: number;
  comments?: string;
  tagIdentifier?: string;
  lastDiscoveredAt?: string;
  lastDiscoveredBy?: string;
  currentLocationId?: number;
  currentLocationName?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface DotNetAssetMovementDto {
  id: number;
  assetId: number;
  assetNumber?: string;
  assetName?: string;
  fromLocationId?: number;
  fromLocationName?: string;
  toLocationId: number;
  toLocationName?: string;
  gateId?: number;
  gateName?: string;
  readerId?: number;
  readerName?: string;
  readerIdString?: string;
  readTimestamp: string;
}

export interface DotNetAssetStatisticsDto {
  totalAssets: number;
  activeAssets: number;
  assetsWithTags: number;
  assetsWithoutTags: number;
  assetsNotSeen30Days: number;
  assetsNotSeen90Days: number;
  totalGates: number;
  activeGates: number;
  totalReaders: number;
  onlineReaders: number;
  totalMovementsLast24Hours: number;
}

// Frontend types
export interface FrontendAsset {
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
  costCenter?: string; // .NET API field
  acquistnValue?: number;
  comment?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  origin?: string;
  discoveryStatus?: string;
  isDecommissioned?: boolean;
  discoveredAt?: Date | string;
  discoveryNotes?: string;
  decommissionedAt?: Date | string;
  decommissionReason?: string;
  rfidTags?: string[];
  tagIdentifier?: string;
  currentLocationId?: number;
  currentLocationName?: string;
  lastDiscoveredAt?: Date | string;
  lastDiscoveredBy?: string;
  storageLocation?: string; // .NET API field
  plant?: string; // .NET API field (mapped from plnt)
}

/**
 * Transform .NET API AssetDto to frontend Asset type
 */
export function transformAssetFromDotNet(dto: DotNetAssetDto): FrontendAsset {
  return {
    id: String(dto.id),
    assetNumber: dto.assetNumber,
    equipment: dto.assetNumber, // Map assetNumber to equipment
    assetName: dto.name,
    name: dto.name,
    description: dto.description,
    material: dto.materialId,
    materialDescription: dto.description,
    serialNumber: dto.serialNumber,
    techIdentNo: dto.technicalId,
    plant: dto.plant,
    plnt: dto.plant,
    costCenter: dto.costCenter,
    costCtr: dto.costCenter,
    storageLocation: dto.storageLocation,
    location: dto.currentLocationName || dto.storageLocation,
    objectType: dto.objectType,
    sysStatus: dto.systemStatus,
    userStatusRaw: dto.userStatus,
    acquistnValue: dto.acquisitionValue,
    comment: dto.comments,
    tagIdentifier: dto.tagIdentifier,
    rfidTags: dto.tagIdentifier ? [dto.tagIdentifier] : [],
    currentLocationId: dto.currentLocationId,
    currentLocationName: dto.currentLocationName,
    lastDiscoveredAt: dto.lastDiscoveredAt
      ? new Date(dto.lastDiscoveredAt)
      : undefined,
    lastDiscoveredBy: dto.lastDiscoveredBy,
    createdAt: new Date(dto.createdAt),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(dto.createdAt),
    isDecommissioned: dto.isDeleted,
    // Map isDeleted to isDecommissioned
    status: dto.isDeleted ? "Decommissioned" : undefined,
  };
}

/**
 * Transform frontend Asset to .NET API CreateAssetDto
 */
export function transformAssetToDotNetCreate(
  asset: Partial<FrontendAsset>
): {
  assetNumber: string;
  name: string;
  description?: string;
  materialId?: string;
  serialNumber?: string;
  technicalId?: string;
  plant?: string;
  storageLocation?: string;
  costCenter?: string;
  assetGroup?: string;
  businessArea?: string;
  objectType?: string;
  systemStatus?: string;
  userStatus?: string;
  acquisitionValue?: number;
  comments?: string;
  tagIdentifier?: string;
  currentLocationId?: number;
} {
  return {
    assetNumber: asset.equipment || asset.assetNumber || "",
    name: asset.assetName || asset.name || "",
    description: asset.description,
    materialId: asset.material,
    serialNumber: asset.serialNumber,
    technicalId: asset.techIdentNo,
    plant: asset.plant || asset.plnt,
    storageLocation: asset.location || asset.storageLocation,
    costCenter: asset.costCenter || asset.costCtr,
    assetGroup: asset.aGrp,
    businessArea: asset.busA,
    objectType: asset.objectType,
    systemStatus: asset.sysStatus,
    userStatus: asset.userStatusRaw,
    acquisitionValue: asset.acquistnValue,
    comments: asset.comment,
    tagIdentifier: asset.tagIdentifier || asset.rfidTags?.[0],
    currentLocationId: asset.currentLocationId,
  };
}

/**
 * Transform frontend Asset to .NET API UpdateAssetDto (all fields optional)
 */
export function transformAssetToDotNetUpdate(
  asset: Partial<FrontendAsset>
): Partial<{
  assetNumber: string;
  name: string;
  description?: string;
  materialId?: string;
  serialNumber?: string;
  technicalId?: string;
  plant?: string;
  storageLocation?: string;
  costCenter?: string;
  assetGroup?: string;
  businessArea?: string;
  objectType?: string;
  systemStatus?: string;
  userStatus?: string;
  acquisitionValue?: number;
  comments?: string;
  tagIdentifier?: string;
  currentLocationId?: number;
}> {
  const result: Record<string, unknown> = {};

  if (asset.equipment !== undefined || asset.assetNumber !== undefined) {
    result.assetNumber = asset.equipment || asset.assetNumber;
  }
  if (asset.assetName !== undefined || asset.name !== undefined) {
    result.name = asset.assetName || asset.name;
  }
  if (asset.description !== undefined) result.description = asset.description;
  if (asset.material !== undefined) result.materialId = asset.material;
  if (asset.serialNumber !== undefined) result.serialNumber = asset.serialNumber;
  if (asset.techIdentNo !== undefined) result.technicalId = asset.techIdentNo;
  if (asset.plant !== undefined || asset.plnt !== undefined) {
    result.plant = asset.plant || asset.plnt;
  }
  if (asset.location !== undefined || asset.storageLocation !== undefined) {
    result.storageLocation = asset.location || asset.storageLocation;
  }
  if (asset.costCenter !== undefined || asset.costCtr !== undefined) {
    result.costCenter = asset.costCenter || asset.costCtr;
  }
  if (asset.aGrp !== undefined) result.assetGroup = asset.aGrp;
  if (asset.busA !== undefined) result.businessArea = asset.busA;
  if (asset.objectType !== undefined) result.objectType = asset.objectType;
  if (asset.sysStatus !== undefined) result.systemStatus = asset.sysStatus;
  if (asset.userStatusRaw !== undefined) result.userStatus = asset.userStatusRaw;
  if (asset.acquistnValue !== undefined) {
    result.acquisitionValue = asset.acquistnValue;
  }
  if (asset.comment !== undefined) result.comments = asset.comment;
  if (asset.tagIdentifier !== undefined || asset.rfidTags?.[0] !== undefined) {
    result.tagIdentifier = asset.tagIdentifier || asset.rfidTags?.[0];
  }
  if (asset.currentLocationId !== undefined) {
    result.currentLocationId = asset.currentLocationId;
  }

  return result;
}

/**
 * Transform .NET API pagination response to frontend format
 */
export function transformPaginatedResponse<T>(
  dotNetResponse: T[],
  totalCount: number,
  page: number,
  pageSize: number
): {
  assets: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  return {
    assets: dotNetResponse,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

/**
 * Transform .NET API statistics to frontend format
 */
export function transformStatisticsFromDotNet(
  stats: DotNetAssetStatisticsDto
): {
  assetStats: {
    totalAssets: number;
    activeAssets: number;
    maintenanceAssets: number;
    categoriesCount: number;
    locationsCount: number;
    undiscoveredAssets: number;
  };
  decommissionStats: {
    totalDecommissioned: number;
    readyForRecommission: number;
    pendingDisposal: number;
    averageDowntimeDays: number;
  };
} {
  return {
    assetStats: {
      totalAssets: stats.totalAssets,
      activeAssets: stats.activeAssets,
      maintenanceAssets: 0, // Not available in .NET API
      categoriesCount: 0, // Not available in .NET API
      locationsCount: 0, // Not available in .NET API
      undiscoveredAssets: stats.assetsNotSeen30Days,
    },
    decommissionStats: {
      totalDecommissioned: stats.totalAssets - stats.activeAssets,
      readyForRecommission: 0, // Not available in .NET API
      pendingDisposal: 0, // Not available in .NET API
      averageDowntimeDays: 0, // Not available in .NET API
    },
  };
}

/**
 * Transform .NET API movement to frontend live feed format
 */
export function transformMovementToLiveFeed(
  movement: DotNetAssetMovementDto
): {
  assetId: string | null;
  lastSeenEpc: string | null;
  lastSeenAt: string;
  lastSeenReaderId: string | null;
  lastSeenGate: string | null;
  lastSeenDirection: string;
  assetName: string | null;
  equipment: string | null;
  assetTag: string | null;
  location: string | null;
  category: string | null;
  status: string | null;
} {
  return {
    assetId: movement.assetId ? String(movement.assetId) : null,
    lastSeenEpc: null, // Not available in movement DTO
    lastSeenAt: movement.readTimestamp,
    lastSeenReaderId: movement.readerIdString || movement.readerId?.toString() || null,
    lastSeenGate: movement.gateName || null,
    lastSeenDirection: "in", // Default
    assetName: movement.assetName || null,
    equipment: movement.assetNumber || null,
    assetTag: movement.assetNumber || null,
    location: movement.toLocationName || null,
    category: null,
    status: null,
  };
}

