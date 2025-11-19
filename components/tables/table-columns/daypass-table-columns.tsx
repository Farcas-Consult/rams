"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Receipt } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DayPassRecord } from "@/app/(modules)/dashboard/daypass/types/daypass-types";
import Link from "next/link";
import { getStatusColor } from "@/shared/helpers/statusColor";

export const useDayPassColumns = (): ColumnDef<DayPassRecord>[] => {
  return [
    {
      accessorKey: "full_name",
      header: "Customer",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{record.full_name}</span>
            <span className="text-sm text-muted-foreground">{record.phone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "plan_name",
      header: "Plan",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.plan_name}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.original.amount);
        const currency = row.original.currency;
        return (
          <div className="text-sm font-medium">
            {currency} {amount.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: ({ row }) => {
        const method = row.original.payment_method;
        return (
          <Badge variant="outline" className="capitalize">
            {method}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "collected_by_name",
      header: "Collected By",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.collected_by_name}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const createdAt = new Date(row.original.created_at);
        return (
          <div className="text-sm">
            {createdAt.toLocaleDateString()}
            <div className="text-xs text-muted-foreground">
              {createdAt.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;

        return (
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
                <Link href={`/dashboard/daypass/${record.id}/details`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/daypass/${record.id}/receipt`} className="cursor-pointer">
                  <Receipt className="mr-2 h-4 w-4" />
                  View Receipt
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}; 