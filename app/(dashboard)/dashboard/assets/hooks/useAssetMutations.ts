"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAsset,
  updateAsset,
  deleteAsset,
  importAssets,
  // decommissionAsset,
  // recommissionAsset,
} from "../services/asset-service";
import { CreateAssetInput, UpdateAssetInput, ImportAssetsInput } from "../schemas/asset-schemas";

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetInput) => createAsset(data),
    onSuccess: () => {
      toast.success("Asset created successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create asset: ${error.message}`);
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAssetInput) => updateAsset(data),
    onSuccess: () => {
      toast.success("Asset updated successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update asset: ${error.message}`);
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete asset: ${error.message}`);
    },
  });
};

export const useImportAssets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportAssetsInput) => importAssets(data),
    onSuccess: (result) => {
      toast.success(
        `Successfully imported ${result.success} assets${result.failed > 0 ? `, ${result.failed} failed` : ""}`
      );
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to import assets: ${error.message}`);
    },
  });
};

// Decommission and recommission flows are temporarily disabled.
// export const useDecommissionAsset = () => { ... }
// export const useRecommissionAsset = () => { ... }

