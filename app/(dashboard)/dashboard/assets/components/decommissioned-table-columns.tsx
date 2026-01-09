"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransformedAsset } from "../types/asset-types";

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
    // Actions column disabled while decommissioning workflow is turned off
  ];
};
