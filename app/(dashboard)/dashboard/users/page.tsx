"use client";

import { useState } from "react";
import { GenericTable } from "@/components/tables/generic-table";
import { useUserColumns } from "./components/user-table-columns";
import { useUsers } from "./hooks/useUsers";
import { UserKPICards } from "./components/user-kpi-cards";
import { UserQuery } from "./schemas/user-schemas";
import { TransformedUser } from "./types/user-types";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function UsersPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState<UserQuery>({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useUsers(query);
  const columns = useUserColumns();

  // Update query when pagination changes
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their accounts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/new">
            <IconPlus className="mr-2 size-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <UserKPICards />

      {/* Users Table */}
      <div className="px-4 lg:px-6">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Error loading users</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          </div>
        ) : (
          <GenericTable<TransformedUser>
            data={data?.users || []}
            columns={columns}
            pagination={pagination}
            setPagination={handlePaginationChange}
            pageCount={data?.totalPages || -1}
            pending={isLoading}
            role={"admin" as any}
            tableType="users"
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

