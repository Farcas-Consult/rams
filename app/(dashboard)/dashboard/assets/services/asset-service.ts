import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetQuery,
  PaginatedAssetResponse,
  AssetResponse,
  ImportAssetsInput,
} from "../schemas/asset-schemas";

/**
 * Asset Service
 * 
 * This service handles all API calls related to assets.
 * Currently returns dummy data - will be integrated with backend when database is ready.
 */

const API_BASE_URL = "/api/assets"; // Will be used when backend is ready

/**
 * Generate dummy assets for development
 */
const STATUSES = ["Active", "Inactive", "Maintenance", "Decommissioned", "Retired"] as const;

const generateDummyAssets = (count: number = 20): AssetResponse[] => {
  const categories = ["IT Equipment", "Furniture", "Vehicles", "Machinery", "Electronics"];
  const statuses = STATUSES;
  const locations = ["Office A", "Office B", "Warehouse", "Remote", "Field"];
  const manufacturers = ["Dell", "HP", "Apple", "Samsung", "Lenovo", "Microsoft"];
  const models = ["Model X", "Model Y", "Pro Series", "Enterprise", "Standard"];

  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const purchaseDate = new Date(createdAt.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);

    return {
      id: `asset-${i + 1}`,
      assetTag: `TAG-${String(i + 1).padStart(6, "0")}`,
      assetName: `Asset ${i + 1}`,
      category: categories[i % categories.length],
      location: locations[i % locations.length],
      status: statuses[i % statuses.length],
      assignedTo: i % 3 === 0 ? `User ${Math.floor(i / 3) + 1}` : undefined,
      purchaseDate,
      purchasePrice: Math.floor(Math.random() * 10000) + 100,
      serialNumber: `SN-${String(i + 1).padStart(8, "0")}`,
      manufacturer: manufacturers[i % manufacturers.length],
      model: models[i % models.length],
      description: `Description for asset ${i + 1}`,
      createdAt,
      updatedAt,
    };
  });
};

/**
 * Get all assets with pagination and filters
 */
export const getAssets = async (
  query: AssetQuery
): Promise<PaginatedAssetResponse> => {
  // TODO: Replace with actual API call when backend is ready
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  const allAssets = generateDummyAssets(50);
  const { page, pageSize, search, category, status, location, sortBy, sortOrder } = query;

  let filteredAssets = [...allAssets];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredAssets = filteredAssets.filter(
      (asset) =>
        asset.assetName.toLowerCase().includes(searchLower) ||
        asset.assetTag?.toLowerCase().includes(searchLower) ||
        asset.serialNumber?.toLowerCase().includes(searchLower) ||
        asset.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (category) {
    filteredAssets = filteredAssets.filter((asset) => asset.category === category);
  }

  // Apply status filter
  if (status) {
    filteredAssets = filteredAssets.filter((asset) => asset.status === status);
  }

  // Apply location filter
  if (location) {
    filteredAssets = filteredAssets.filter((asset) => asset.location === location);
  }

  // Apply sorting
  if (sortBy) {
    filteredAssets.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "purchaseDate" || sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  return {
    assets: paginatedAssets,
    total: filteredAssets.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredAssets.length / pageSize),
  };
};

/**
 * Get a single asset by ID
 */
export const getAssetById = async (id: string): Promise<AssetResponse | null> => {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  const allAssets = generateDummyAssets(50);
  return allAssets.find((asset) => asset.id === id) || null;
};

/**
 * Create a new asset
 */
export const createAsset = async (
  data: CreateAssetInput
): Promise<AssetResponse> => {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newAsset: AssetResponse = {
    id: `asset-${Date.now()}`,
    assetTag: data.assetTag,
    assetName: data.assetName,
    category: data.category,
    location: data.location,
    status: data.status || "Active",
    assignedTo: data.assignedTo,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
    purchasePrice: data.purchasePrice,
    serialNumber: data.serialNumber,
    manufacturer: data.manufacturer,
    model: data.model,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newAsset;
};

/**
 * Bulk import assets from Excel
 */
export const importAssets = async (
  data: ImportAssetsInput
): Promise<{ success: number; failed: number; errors: string[] }> => {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate import - in real implementation, this would create all assets
  const success = data.assets.length;
  const failed = 0;
  const errors: string[] = [];

  return { success, failed, errors };
};

/**
 * Update an existing asset
 */
export const updateAsset = async (
  data: UpdateAssetInput
): Promise<AssetResponse> => {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const existingAsset = generateDummyAssets(1)[0];
  return {
    ...existingAsset,
    ...data,
    id: data.id,
    status: data.status || existingAsset.status,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : existingAsset.purchaseDate,
    updatedAt: new Date(),
  };
};

/**
 * Delete an asset by ID
 */
export const deleteAsset = async (id: string): Promise<void> => {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * Decommission an asset (mark as Decommissioned)
 */
export const decommissionAsset = async (id: string): Promise<AssetResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const asset = generateDummyAssets(1)[0];
  return {
    ...asset,
    id,
    status: "Decommissioned",
    updatedAt: new Date(),
  };
};

/**
 * Recommission an asset (set status back to Active)
 */
export const recommissionAsset = async (id: string): Promise<AssetResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const asset = generateDummyAssets(1)[0];
  return {
    ...asset,
    id,
    status: "Active",
    updatedAt: new Date(),
  };
};

/**
 * Get asset statistics/KPIs
 */
export const getAssetStats = async () => {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  const allAssets = generateDummyAssets(50);
  const activeCount = allAssets.filter((a) => a.status === "Active").length;
  const totalValue = allAssets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const categoriesCount = new Set(allAssets.map((a) => a.category)).size;
  const decommissionedCount = allAssets.filter((a) => a.status === "Decommissioned").length;
  const maintenanceCount = allAssets.filter((a) => a.status === "Maintenance").length;

  return {
    totalAssets: allAssets.length,
    activeAssets: activeCount,
    totalValue,
    categoriesCount,
    locationsCount: new Set(allAssets.map((a) => a.location)).size,
    decommissionedAssets: decommissionedCount,
    maintenanceAssets: maintenanceCount,
  };
};

/**
 * Get decommissioning-specific stats
 */
export const getDecommissionStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const allAssets = generateDummyAssets(50);
  const decommissioned = allAssets.filter((a) => a.status === "Decommissioned");
  const pendingDisposal = decommissioned.slice(0, Math.floor(decommissioned.length * 0.4));
  const readyForRecommission = decommissioned.slice(Math.floor(decommissioned.length * 0.4));

  const avgDowntime =
    decommissioned.length > 0
      ? Math.round(
          decommissioned.reduce((sum, asset) => {
            const updated = new Date(asset.updatedAt).getTime();
            const created = new Date(asset.createdAt).getTime();
            return sum + Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
          }, 0) / decommissioned.length
        )
      : 0;

  return {
    totalDecommissioned: decommissioned.length,
    readyForRecommission: readyForRecommission.length,
    pendingDisposal: pendingDisposal.length,
    averageDowntimeDays: avgDowntime,
  };
};

