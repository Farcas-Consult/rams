"use client";

import { useState } from "react";
import { GenericTable } from "@/components/tables/generic-table";
import { useDecommissionedAssetColumns } from "../assets/components/decommissioned-table-columns";
import { useAssets } from "../assets/hooks/useAssets";
import { DecommissionKPICards } from "../assets/components/decommission-kpi-cards";
import { TransformedAsset } from "../assets/types/asset-types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconArrowLeftRight } from "@tabler/icons-react";

export default function DecommissioningPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: "Decommissioned" as const,
    sortBy: "updatedAt" as const,
    sortOrder: "desc" as const,
  });

  const { data, isLoading, error } = useAssets(query);
  const columns = useDecommissionedAssetColumns();

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPagination(newPagination);
    setQuery((prev) => ({
      ...prev,
      page: newPagination.pageIndex + 1,
      pageSize: newPagination.pageSize,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decommissioning</h1>
          <p className="text-muted-foreground">
            Manage assets that are currently decommissioned and ready for next steps
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/assets">
            <IconArrowLeftRight className="mr-2 h-4 w-4" />
            Back to Assets
          </Link>
        </Button>
      </div>

      <DecommissionKPICards />

      <div className="px-4 lg:px-6">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Error loading decommissioned assets</p>
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
            tableType={undefined as any}
            withFilters={false}
            withPagination={true}
            initialSorting={[
              {
                id: "updatedAt",
                desc: true,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

