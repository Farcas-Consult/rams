/**
 * Asset type definition
 * Based on common asset management fields - adjust based on your Excel structure
 */
export type Asset = {
  id: string;
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
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Transformed asset type for table display
 */
export type TransformedAsset = Asset;

