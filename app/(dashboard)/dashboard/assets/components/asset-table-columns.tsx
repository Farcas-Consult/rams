"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Trash2, Compass } from "lucide-react";
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
import { useState, type ReactNode } from "react";
import { DeleteAssetDialog } from "./delete-asset-dialog";
import { AssetDetailDrawer } from "./asset-detail-drawer";

export const useAssetColumns = (): ColumnDef<TransformedAsset>[] => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<TransformedAsset | null>(null);

  const handleDeleteClick = (asset: TransformedAsset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
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
            {value || row.assetTag || "View Asset"}
          </Button>
        </AssetDetailDrawer>
      ),
    },
    { key: "materialDescription", label: "Material Description" },
    { key: "description", label: "Description" },
    { key: "sysStatus", label: "SysStatus" },
    { key: "userStatusRaw", label: "UserStatus" },
    {
      key: "acquistnValue",
      label: "AcquistnValue",
      formatter: (value) =>
        typeof value === "number" ? (
          <div className="text-sm font-medium">${value.toLocaleString()}</div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
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
        return (
          <div className="text-sm">
            {typeof value === "string" && value.length > 60
              ? `${value.slice(0, 60)}…`
              : value}
          </div>
        );
      },
    })
  );

  return [
    ...dataColumns,
    {
      id: "origin",
      header: "Origin",
      cell: ({ row }) => {
        const origin = row.original.origin || "inventory";
        const isDiscovered = origin === "discovered";
        return (
          <Badge
            variant="outline"
            className={isDiscovered ? "border-blue-400 text-blue-600 dark:text-blue-300" : ""}
          >
            {isDiscovered ? "Discovered" : "Catalogued"}
          </Badge>
        );
      },
    },
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
                {!isDiscovered ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(asset)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Asset
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/assets/new" className="cursor-pointer">
                        <Compass className="mr-2 h-4 w-4" />
                        Catalog Asset
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
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

