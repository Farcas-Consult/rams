"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAsset } from "../hooks/useAssetMutations";
import { TransformedAsset } from "../types/asset-types";

interface DeleteAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: TransformedAsset | null;
  onSuccess?: () => void;
}

export function DeleteAssetDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: DeleteAssetDialogProps) {
  const { mutateAsync: deleteAsset, isPending } = useDeleteAsset();

  const handleConfirm = async () => {
    if (!asset) return;

    try {
      await deleteAsset(asset.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Delete error:", error);
    }
  };

  if (!asset) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the asset{" "}
            <strong>{asset.assetName}</strong> ({asset.assetTag || asset.id}) and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

