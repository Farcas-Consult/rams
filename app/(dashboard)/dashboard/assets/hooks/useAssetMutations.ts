"use client";

import { useState } from "react";
import {
  createAsset,
  updateAsset,
  deleteAsset,
  importAssets,
} from "../services/asset-service";
import {
  CreateAssetInput,
  UpdateAssetInput,
  ImportAssetsInput,
} from "../schemas/asset-schemas";
import { toast } from "sonner";

/**
 * Hook to create a new asset
 */
export const useCreateAsset = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: CreateAssetInput) => {
    setIsPending(true);
    try {
      const result = await createAsset(data);
      toast.success("Asset created successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create asset";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

/**
 * Hook to update an existing asset
 */
export const useUpdateAsset = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: UpdateAssetInput) => {
    setIsPending(true);
    try {
      const result = await updateAsset(data);
      toast.success("Asset updated successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update asset";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

/**
 * Hook to delete an asset
 */
export const useDeleteAsset = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (id: string) => {
    setIsPending(true);
    try {
      await deleteAsset(id);
      toast.success("Asset deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete asset";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

/**
 * Hook to import assets from Excel
 */
export const useImportAssets = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: ImportAssetsInput) => {
    setIsPending(true);
    try {
      const result = await importAssets(data);
      toast.success(
        `Successfully imported ${result.success} assets${result.failed > 0 ? `, ${result.failed} failed` : ""}`
      );
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import assets";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

