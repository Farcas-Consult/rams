import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DragHandle } from "@/components/tables/components/drag-handle";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/shared/helpers/statusColor";
import { StaffMember } from "@/app/(modules)/dashboard/staff/types/staff-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import { DeleteStaffDialog } from "@/components/dialogs/delete-staff-dialog";
import { useDeleteStaff } from "@/app/(modules)/dashboard/hooks/useStaffHook";

export const useStaffColumns = (): ColumnDef<StaffMember>[] => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const { deleteStaff, isPending } = useDeleteStaff();

  const handleDeleteClick = (staff: StaffMember) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      deleteStaff(staffToDelete.id); // Use staff ID instead of user_id
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  return [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.user_id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "display_name",
      header: "Staff Member",
      cell: ({ row }) => {
        const staff = row.original;
        const displayName = staff.display_name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
        const initials = displayName
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={staff.profile_image_url || staff.profile_picture || ''} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{displayName}</span>
              <span className="text-sm text-muted-foreground">{staff.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.phone || row.original.phone_number}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <div className="text-sm capitalize">
            {role || 'N/A'}
          </div>
        );
      },
    },
  
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || (row.original.active===true  ? 'active' : 'inactive');
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "hire_date",
      header: "Hire Date",
      cell: ({ row }) => {
        const hireDate = row.original.hire_date;
        if (!hireDate) return <div className="text-sm text-muted-foreground">N/A</div>;
        
        return (
          <div className="text-sm">
            {new Date(hireDate).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const staff = row.original;

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
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/staff/${staff.user_id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/staff/${staff.user_id}`} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Staff
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDeleteClick(staff)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Staff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            {staffToDelete && (
              <DeleteStaffDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                staffName={staffToDelete.display_name || `${staffToDelete.first_name || ''} ${staffToDelete.last_name || ''}`.trim()}
                staffEmail={staffToDelete.email}
                onConfirm={handleConfirmDelete}
                isPending={isPending}
              />
            )}
          </>
        );
      },
    },
  ];
}; 