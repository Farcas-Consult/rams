"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransformedMember } from "@/app/(modules)/dashboard/members/types/member-api-types";
import Link from "next/link";
import { getStatusColor } from "@/shared/helpers/statusColor";
import { useState } from "react";
import { DeleteMemberDialog } from "@/components/dialogs/delete-member-dialog";
import { useDeleteMember } from "@/app/(modules)/dashboard/hooks/useMemberHook";
import { cn } from "@/lib/utils";

export const useMemberColumns = (): ColumnDef<TransformedMember>[] => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TransformedMember | null>(null);
  const { deleteMember, isPending } = useDeleteMember();

  const handleDeleteClick = (member: TransformedMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id); // Use member ID instead of user_id
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  // Check if member can be deleted (not active or frozen)
  const canDeleteMember = (status: string) => {
    return !['active', 'frozen'].includes(status.toLowerCase());
  };

  return [
    {
      accessorKey: "display_name",
      header: "Member",
      cell: ({ row }) => {
        const member = row.original;
        const displayName = `${member.first_name} ${member.last_name}`.trim();
        const initials = displayName
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.profile_image_url || ''} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{displayName}</span>
              <span className="text-sm text-muted-foreground">{member.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "turnstile_id",
      header: "Turnstile ID",
      cell: ({ row }) => {
        return (
          <div className="text-sm font-mono text-muted-foreground">
            {row.original.turnstile_id}
          </div>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.phone_number}
          </div>
        );
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.original.gender;
        return (
          <div className="text-sm capitalize">
            {gender}
          </div>
        );
      },
    },
    {
      accessorKey: "membership_plan",
      header: "Plan",
      cell: ({ row }) => {
        const plan = row.original.membership_plan;
        return (
          <div className="text-sm">
            {plan}
          </div>
        );
      },
    },
    {
      accessorKey: "membership_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.membership_status;
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "membership_dates",
      header: "Membership Period",
      cell: ({ row }) => {
        const member = row.original;
        const startDate = member.subscription_start_date;
        const endDate = member.subscription_end_date;
        
        if (!startDate && !endDate) {
          return (
            <div className="text-sm text-muted-foreground">
              No active subscription
            </div>
          );
        }
        
        return (
          <div className="text-sm">
            {startDate && (
              <div>Start: {new Date(startDate).toLocaleDateString()}</div>
            )}
            {endDate && (
              <div className="text-muted-foreground">
                End: {new Date(endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
        const canDelete = canDeleteMember(member.membership_status);

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
                  <Link href={`/dashboard/members/${member.user_id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/members/${member.user_id}`} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Member
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer",
                    canDelete ? "text-red-600" : "text-muted-foreground cursor-not-allowed"
                  )}
                  onClick={() => canDelete && handleDeleteClick(member)}
                  disabled={!canDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Member
                  {!canDelete && (
                    <span className="ml-2 text-xs">(Active/Frozen members cannot be deleted)</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            {memberToDelete && (
              <DeleteMemberDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                memberName={`${memberToDelete.first_name} ${memberToDelete.last_name}`}
                memberEmail={memberToDelete.email}
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