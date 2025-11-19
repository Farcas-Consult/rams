"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";

import { GenericTable } from "@/components/tables/generic-table";
import { Button } from "@/components/ui/button";

import { useUserColumns } from "./user-table-columns";
import { useUsers } from "../hooks/useUsers";
import { UserKPICards } from "./user-kpi-cards";
import type { UserQuery } from "../schemas/user-schemas";
import type { TransformedUser } from "../types/user-types";

interface UsersPageClientProps {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canResend: boolean;
}

export function UsersPageClient({
  canCreate,
  canUpdate,
  canDelete,
  canResend,
}: UsersPageClientProps) {
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
  const columns = useUserColumns({ canUpdate, canDelete, canResend });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their accounts
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/users/new">
              <IconPlus className="mr-2 size-4" />
              Add User
            </Link>
          </Button>
        )}
      </div>

      <UserKPICards />

      <div className="px-4 lg:px-6">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Error loading users</p>
            <p className="text-sm">
              {error instanceof Error
                ? error.message
                : "An unknown error occurred"}
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
            withFilters
            withPagination
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

