import { z } from "zod";

/**
 * Schema for creating a new asset
 */
export const createAssetSchema = z.object({
  plnt: z.string().optional(),
  equipment: z.string().optional(),
  material: z.string().optional(),
  materialDescription: z.string().optional(),
  techIdentNo: z.string().optional(),
  assetTag: z.string().optional(),
  assetName: z.string().min(1, "Asset name is required"),
  category: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  manufSerialNumber: z.string().optional(),
  sysStatus: z.string().optional(),
  userStatusRaw: z.string().optional(),
  sLoc: z.string().optional(),
  pfUserAc: z.string().optional(),
  pfUserAccountableDescription: z.string().optional(),
  pfPropMg: z.string().optional(),
  pfPropMgmFocalPointDescription: z.string().optional(),
  functionalLoc: z.string().optional(),
  functionalLocDescription: z.string().optional(),
  aGrp: z.string().optional(),
  busA: z.string().optional(),
  objectType: z.string().optional(),
  costCtr: z.string().optional(),
  acquistnValue: z.number().optional(),
  comment: z.string().optional(),
  origin: z.enum(["inventory", "import", "discovered"]).optional(),
  discoveryStatus: z.enum(["catalogued", "pending_review", "undiscovered"]).optional(),
  isDecommissioned: z.boolean().optional(),
  discoveredAt: z.string().optional(),
  discoveryNotes: z.string().optional(),
  decommissionedAt: z.string().optional(),
  decommissionReason: z.string().optional(),
});

/**
 * Schema for updating an existing asset
 */
export const updateAssetSchema = z.object({
  id: z.string().min(1, "Asset ID is required").optional(),
  plnt: z.string().optional(),
  equipment: z.string().optional(),
  material: z.string().optional(),
  materialDescription: z.string().optional(),
  techIdentNo: z.string().optional(),
  assetTag: z.string().optional(),
  assetName: z.string().min(1, "Asset name is required").optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  manufSerialNumber: z.string().optional(),
  sysStatus: z.string().optional(),
  userStatusRaw: z.string().optional(),
  sLoc: z.string().optional(),
  pfUserAc: z.string().optional(),
  pfUserAccountableDescription: z.string().optional(),
  pfPropMg: z.string().optional(),
  pfPropMgmFocalPointDescription: z.string().optional(),
  functionalLoc: z.string().optional(),
  functionalLocDescription: z.string().optional(),
  aGrp: z.string().optional(),
  busA: z.string().optional(),
  objectType: z.string().optional(),
  costCtr: z.string().optional(),
  acquistnValue: z.number().optional(),
  comment: z.string().optional(),
  origin: z.string().optional(),
  discoveryStatus: z.string().optional(),
  isDecommissioned: z.boolean().optional(),
  discoveredAt: z.string().optional(),
  discoveryNotes: z.string().optional(),
  decommissionedAt: z.string().optional(),
  decommissionReason: z.string().optional(),
});

/**
 * Schema for bulk importing assets from Excel
 */
export const importAssetsSchema = z.object({
  assets: z.array(createAssetSchema).min(1, "At least one asset is required"),
});

/**
 * Schema for asset query/filter parameters
 */
export const assetQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  sortBy: z
    .enum([
      "assetName",
      "category",
      "status",
      "location",
      "purchaseDate",
      "createdAt",
      "updatedAt",
    ])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for asset response from API
 */
export const assetResponseSchema = z.object({
  id: z.string(),
  plnt: z.string().optional(),
  equipment: z.string().optional(),
  material: z.string().optional(),
  materialDescription: z.string().optional(),
  techIdentNo: z.string().optional(),
  assetTag: z.string().optional(),
  assetName: z.string(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.date().or(z.string()).optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  manufSerialNumber: z.string().optional(),
  sysStatus: z.string().optional(),
  userStatusRaw: z.string().optional(),
  sLoc: z.string().optional(),
  pfUserAc: z.string().optional(),
  pfUserAccountableDescription: z.string().optional(),
  pfPropMg: z.string().optional(),
  pfPropMgmFocalPointDescription: z.string().optional(),
  functionalLoc: z.string().optional(),
  functionalLocDescription: z.string().optional(),
  aGrp: z.string().optional(),
  busA: z.string().optional(),
  objectType: z.string().optional(),
  costCtr: z.string().optional(),
  acquistnValue: z.number().optional(),
  comment: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  origin: z.string().optional(),
  discoveryStatus: z.string().optional(),
  isDecommissioned: z.boolean().optional(),
  discoveredAt: z.date().or(z.string()).optional(),
  discoveryNotes: z.string().optional(),
  decommissionedAt: z.date().or(z.string()).optional(),
  decommissionReason: z.string().optional(),
});

/**
 * Schema for paginated asset response
 */
export const paginatedAssetResponseSchema = z.object({
  assets: z.array(assetResponseSchema),
  undiscoveredAssets: z.array(assetResponseSchema).optional(),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// Type exports
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type ImportAssetsInput = z.infer<typeof importAssetsSchema>;
export type AssetQuery = z.infer<typeof assetQuerySchema>;
export type AssetResponse = z.infer<typeof assetResponseSchema>;
export type PaginatedAssetResponse = z.infer<typeof paginatedAssetResponseSchema>;
