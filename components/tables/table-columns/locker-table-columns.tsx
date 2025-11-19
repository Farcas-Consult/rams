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
import { LockerWithAssignment, LockerType, LockerStatus } from "@/app/(modules)/dashboard/lockers/types/locker-types";

interface LockerTableActionsProps {
  onView: (locker: LockerWithAssignment) => void;
  onEdit: (locker: LockerWithAssignment) => void;
  onDelete: (locker: LockerWithAssignment) => void;
  isDeleting?: boolean;
}

export const useLockerColumns = (actions: LockerTableActionsProps): ColumnDef<LockerWithAssignment>[] => {
  const getStatusBadge = (status: LockerStatus, isAvailable: boolean) => {
    if (!isAvailable) {
      return <Badge variant="secondary">Occupied</Badge>;
    }

    switch (status) {
      case 'available':
        return <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Maintenance</Badge>;
      case 'out_of_order':
        return <Badge variant="destructive">Out of Order</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: LockerType) => {
    return (
      <Badge variant={type === 'private' ? 'default' : 'outline'}>
        {type === 'private' ? '🔒 Private' : '🔓 Public'}
      </Badge>
    );
  };

  return [
    {
      accessorKey: "locker_number",
      header: "Locker #",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.locker_number}
          </div>
        );
      },
    },
    {
      accessorKey: "locker_type",
      header: "Type",
      cell: ({ row }) => {
        return getTypeBadge(row.original.locker_type);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return getStatusBadge(row.original.status, row.original.is_active);
      },
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => {
        return (
          <div className="capitalize text-sm">
            {row.original.size}
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.location || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: "assignment",
      header: "Assignment",
      cell: ({ row }) => {
        const assignment = row.original.current_assignment;
        
        if (assignment) {
          return (
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-600">
                Member Assigned
              </p>
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(assignment.end_date).toLocaleDateString()}
              </p>
            </div>
          );
        }
        
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Available
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const locker = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => actions.onView(locker)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onEdit(locker)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Locker
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => actions.onDelete(locker)}
                className="text-red-600"
                disabled={actions.isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {actions.isDeleting ? 'Deleting...' : 'Delete Locker'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
