"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDecommissionAsset } from "../hooks/useAssetMutations";
import { TransformedAsset } from "../types/asset-types";

interface DecommissionAssetDialogProps {
  asset: TransformedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DecommissionAssetDialog({
  asset,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: DecommissionAssetDialogProps) {
  const { mutateAsync: decommissionAsset, isPending } = useDecommissionAsset();

  const handleConfirm = async () => {
    if (!asset) return;
    try {
      await decommissionAsset(asset.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Decommission error:", error);
    }
  };

  if (!asset) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    onOpenChange(nextOpen);
  };

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Decommission asset?</DialogTitle>
        <DialogDescription className="space-y-1 text-sm">
          <p>
            This will move <strong>{asset.assetName}</strong> ({asset.assetTag || asset.equipment})
            to the decommissioning list.
          </p>
          <p className="text-xs text-muted-foreground">
            You can recommission it later from the Decommissioning tab.
          </p>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="sm:justify-between">
        <DialogClose asChild disabled={isPending}>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleConfirm}
          disabled={isPending}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-3.5 w-3.5" />
              Processing...
            </span>
          ) : (
            "Confirm"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {content}
    </Dialog>
  );
}

