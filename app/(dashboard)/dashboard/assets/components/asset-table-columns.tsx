"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PowerOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransformedAsset } from "../types/asset-types";
import { useState, type ReactNode } from "react";
import { DecommissionAssetDialog } from "./decommission-asset-dialog";
import { AssetDetailDrawer } from "./asset-detail-drawer";

export const useAssetColumns = (): ColumnDef<TransformedAsset>[] => {
  const [decommissionDialogOpen, setDecommissionDialogOpen] = useState(false);
  const [assetToDecommission, setAssetToDecommission] = useState<TransformedAsset | null>(null);

  const handleDecommissionClick = (asset: TransformedAsset) => {
    setAssetToDecommission(asset);
    setDecommissionDialogOpen(true);
  };

  const summaryColumns: {
    key: keyof TransformedAsset;
    label: string;
    formatter?: (value: any, row: TransformedAsset) => ReactNode;
  }[] = [
    { key: "plnt", label: "Plnt" },
    {
      key: "equipment",
      label: "Equipment",
      formatter: (value, row) => (
        <AssetDetailDrawer asset={row}>
          <Button variant="link" className="h-auto p-0 text-left font-mono">
            {value || row.assetTag || row.assetNumber || "View Asset"}
          </Button>
        </AssetDetailDrawer>
      ),
    },
    { key: "materialDescription", label: "Material Description" },
    { key: "description", label: "Description" },
    { key: "comment", label: "Comment" },
  ];

  const dataColumns: ColumnDef<TransformedAsset>[] = summaryColumns.map(
    ({ key, label, formatter }) => ({
      accessorKey: key,
      header: label,
      cell: ({ row }) => {
        const value = row.original[key];
        if (formatter) {
          return <div className="text-sm">{formatter(value, row.original)}</div>;
        }
        if (!value) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        const displayValue =
          value instanceof Date
            ? value.toLocaleDateString()
            : typeof value === "string" && value.length > 60
              ? `${value.slice(0, 60)}…`
              : String(value);
        return <div className="text-sm">{displayValue}</div>;
      },
    })
  );

  return [
    ...dataColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const asset = row.original;
        const isDiscovered = asset.origin === "discovered";

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
                {!isDiscovered && asset.status !== "Decommissioned" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onClick={() => handleDecommissionClick(asset)}
                    >
                      <PowerOff className="mr-2 h-4 w-4" />
                      Decommission
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DecommissionAssetDialog
              open={decommissionDialogOpen}
              onOpenChange={setDecommissionDialogOpen}
              asset={assetToDecommission}
              onSuccess={() => setAssetToDecommission(null)}
            />
          </>
        );
      },
    },
  ];
};

