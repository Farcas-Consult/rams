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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteAsset } from "../hooks/useAssetMutations";
import { TransformedAsset } from "../types/asset-types";
import { Spinner } from "@/components/ui/spinner";

interface DeleteAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: TransformedAsset | null;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteAssetDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
  trigger,
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

  const content = (
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
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-3.5 w-3.5" />
              Deleting...
            </span>
          ) : (
            "Delete"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    onOpenChange(nextOpen);
  };

  if (trigger) {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        {content}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {content}
    </AlertDialog>
  );
}

