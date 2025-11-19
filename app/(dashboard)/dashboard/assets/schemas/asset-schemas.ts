import { z } from "zod";

/**
 * Schema for creating a new asset
 */
export const assetStatusEnum = z.enum([
  "Active",
  "Inactive",
  "Maintenance",
  "Decommissioned",
  "Retired",
]);

export const createAssetSchema = z.object({
  assetTag: z.string().optional(),
  assetName: z.string().min(1, "Asset name is required"),
  category: z.string().optional(),
  location: z.string().optional(),
  status: assetStatusEnum.default("Active"),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Schema for updating an existing asset
 */
export const updateAssetSchema = z.object({
  id: z.string().min(1, "Asset ID is required"),
  assetTag: z.string().optional(),
  assetName: z.string().min(1, "Asset name is required").optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: assetStatusEnum.optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
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
  sortBy: z.enum(["assetName", "category", "status", "location", "purchaseDate", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for asset response from API
 */
export const assetResponseSchema = z.object({
  id: z.string(),
  assetTag: z.string().optional(),
  assetName: z.string(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: assetStatusEnum.optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.date().or(z.string()).optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

/**
 * Schema for paginated asset response
 */
export const paginatedAssetResponseSchema = z.object({
  assets: z.array(assetResponseSchema),
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
export type AssetStatus = z.infer<typeof assetStatusEnum>;

