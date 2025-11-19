"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransformedAsset } from "../types/asset-types";
import Link from "next/link";
import { useState } from "react";
import { DeleteAssetDialog } from "./delete-asset-dialog";

export const useAssetColumns = (): ColumnDef<TransformedAsset>[] => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<TransformedAsset | null>(null);

  const handleDeleteClick = (asset: TransformedAsset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  return [
    {
      accessorKey: "assetTag",
      header: "Asset Tag",
      cell: ({ row }) => {
        return (
          <div className="text-sm font-mono font-medium">
            {row.original.assetTag || "N/A"}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "assetName",
      header: "Asset Name",
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.original.assetName}</div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <Badge variant="outline">{category}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.location || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "Unknown";
        const statusColors: Record<string, string> = {
          Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          Maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          Decommissioned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          Retired: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };

        return (
          <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.assignedTo || (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "purchasePrice",
      header: "Purchase Price",
      cell: ({ row }) => {
        const price = row.original.purchasePrice;
        return price ? (
          <div className="text-sm font-medium">
            ${price.toLocaleString()}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) => {
        const date = row.original.purchaseDate;
        if (!date) return <div className="text-sm text-muted-foreground">N/A</div>;

        return (
          <div className="text-sm">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "serialNumber",
      header: "Serial Number",
      cell: ({ row }) => {
        return (
          <div className="text-sm font-mono text-muted-foreground">
            {row.original.serialNumber || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "manufacturer",
      header: "Manufacturer",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.manufacturer || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.model || "N/A"}
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
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/assets/${asset.id}`}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/assets/${asset.id}/edit`}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Asset
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDeleteClick(asset)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Asset
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DeleteAssetDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              asset={assetToDelete}
              onSuccess={() => {
                setAssetToDelete(null);
              }}
            />
          </>
        );
      },
    },
  ];
};

