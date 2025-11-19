"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransformedAsset } from "../types/asset-types";
import { useRecommissionAsset } from "../hooks/useAssetMutations";
import { RefreshCcw } from "lucide-react";
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

export const useDecommissionedAssetColumns = (): ColumnDef<TransformedAsset>[] => {
  return [
    {
      accessorKey: "assetTag",
      header: "Asset Tag",
      cell: ({ row }) => (
        <div className="text-sm font-mono text-muted-foreground">
          {row.original.assetTag || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "assetName",
      header: "Asset Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.assetName}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.category || "Uncategorized"}
        </Badge>
      ),
    },
    {
      accessorKey: "location",
      header: "Last Location",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.location || "Unknown"}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Notes",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground line-clamp-2">
          {row.original.description || "No notes"}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Decommissioned On",
      cell: ({ row }) => {
        const date = row.original.updatedAt;
        return (
          <div className="text-sm">
            {date ? new Date(date).toLocaleDateString() : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <RecommissionAction asset={asset} />
        );
      },
    },
  ];
};

function RecommissionAction({ asset }: { asset: TransformedAsset }) {
  const { mutateAsync: recommissionAsset, isPending } = useRecommissionAsset();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await recommissionAsset(asset.id);
      setOpen(false);
    } catch (error) {
      console.error("Recommission error:", error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => setOpen(true)}
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Recommission
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recommission asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will return <strong>{asset.assetName}</strong> to the active inventory list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Recommissioning..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

