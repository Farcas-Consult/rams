"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { GenericTable } from "@/components/tables/generic-table";
import { useAssetColumns } from "./components/asset-table-columns";
import { useAssets } from "./hooks/useAssets";
import { AssetKPICards } from "./components/asset-kpi-cards";
import { ImportAssetsDialog } from "./components/import-assets-dialog";
import { AssetQuery } from "./schemas/asset-schemas";
import { TransformedAsset } from "./types/asset-types";
import { Button } from "@/components/ui/button";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import Link from "next/link";

export default function AssetsPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [query, setQuery] = useState<AssetQuery>({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useAssets(query);
  const columns = useAssetColumns();

  // Update query when pagination changes
  const handlePaginationChange: Dispatch<
    SetStateAction<{
      pageIndex: number;
      pageSize: number;
    }>
  > = (updater) => {
    setPagination((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      setQuery((prevQuery) => ({
        ...prevQuery,
        page: next.pageIndex + 1,
        pageSize: next.pageSize,
      }));
      return next;
    });
  };

  const handleImportSuccess = () => {
    // Refresh the page or refetch data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage and track all organizational assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <IconUpload className="mr-2 size-4" />
            Import Excel
          </Button>
          <Button asChild>
            <Link href="/dashboard/assets/new">
              <IconPlus className="mr-2 size-4" />
              Add Asset
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <AssetKPICards />

      {/* Import Dialog */}
      <ImportAssetsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />

      {/* Assets Table */}
      <div className="px-4 lg:px-6">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Error loading assets</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          </div>
        ) : (
          <GenericTable<TransformedAsset>
            data={data?.assets || []}
            columns={columns}
            pagination={pagination}
            setPagination={handlePaginationChange}
            pageCount={data?.totalPages || -1}
            pending={isLoading}
            role={"admin" as any}
            tableType="assets"
            withFilters={true}
            withPagination={true}
            initialSorting={[
              {
                id: "createdAt",
                desc: true,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

