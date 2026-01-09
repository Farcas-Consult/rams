import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetQuery,
  PaginatedAssetResponse,
  AssetResponse,
  ImportAssetsInput,
} from "../schemas/asset-schemas";

const API_BASE_URL = "/api/assets";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json();
};

export const getAssets = async (
  query: AssetQuery
): Promise<PaginatedAssetResponse> => {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.location) params.set("location", query.location);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getAssetById = async (id: string): Promise<AssetResponse | null> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  return handleResponse(response);
};

export const createAsset = async (
  data: CreateAssetInput
): Promise<AssetResponse> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateAsset = async (
  data: UpdateAssetInput
): Promise<AssetResponse> => {
  const response = await fetch(`${API_BASE_URL}/${data.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAsset = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to delete asset");
  }
};

export const importAssets = async (
  data: ImportAssetsInput
): Promise<{ success: number; failed: number; errors: string[]; createdAssets: string[] }> => {
  const response = await fetch(`${API_BASE_URL}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const decommissionAsset = async (id: string): Promise<AssetResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    id,
    status: "Decommissioned",
    }),
  });
  return handleResponse(response);
};

export const recommissionAsset = async (id: string): Promise<AssetResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    id,
    status: "Active",
    }),
  });
  return handleResponse(response);
};

export const getAssetStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    cache: "no-store",
  });
  const data = await handleResponse<{
    assetStats: Record<string, number>;
    decommissionStats: Record<string, number>;
  }>(response);
  return data.assetStats;
};

export const getDecommissionStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    cache: "no-store",
  });
  const data = await handleResponse<{
    assetStats: Record<string, number>;
    decommissionStats: Record<string, number>;
  }>(response);
  return data.decommissionStats;
};

export const getTaggingStats = async () => {
  const response = await fetch(`${API_BASE_URL}/tagging-stats`, {
    cache: "no-store",
  });
  return handleResponse<{
    tagged: number;
    untagged: number;
    total: number;
    taggedPct: number;
    untaggedPct: number;
  }>(response);
};

