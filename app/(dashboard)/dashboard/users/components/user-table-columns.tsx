"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Eye, Edit, Trash2, RefreshCw, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransformedUser } from "../types/user-types";
import Link from "next/link";
import { useState } from "react";
import { DeleteUserDialog } from "./delete-user-dialog";
import { useDeleteUser, useUpdateUser } from "../hooks/useUserMutations";

type UserColumnOptions = {
  canUpdate: boolean;
  canDelete: boolean;
  canResend: boolean;
};

export const useUserColumns = ({
  canUpdate,
  canDelete,
  canResend,
}: UserColumnOptions): ColumnDef<TransformedUser>[] => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<TransformedUser | null>(null);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);
  const { mutateAsync: resendInviteMutation } = useUpdateUser();

  const handleDeleteClick = (user: TransformedUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleResendInvite = async (user: TransformedUser) => {
    setResendingUserId(user.id);
    try {
      await resendInviteMutation({ id: user.id, resendInvite: true });
    } catch (error) {
      console.error("Resend invite error:", error);
    } finally {
      setResendingUserId(null);
    }
  };

  return [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const displayName = user.name || "Unknown User";
        const initials = displayName
          .split(" ")
          .map((name) => name.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{displayName}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => {
        return (
          <div className="text-sm font-mono text-muted-foreground">
            {row.original.username}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "inactive";
        const statusColors: Record<string, string> = {
          active: "bg-primary/10 text-primary",
          inactive: "bg-muted text-muted-foreground",
          suspended: "bg-destructive/10 text-destructive",
          invited: "bg-accent text-accent-foreground",
        };
        const isPending = resendingUserId === row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Badge className={statusColors[status] || "bg-muted text-muted-foreground"}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {status === "invited" && canResend && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleResendInvite(row.original)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Resend
                  </>
                )}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.email}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return <div className="text-sm text-muted-foreground">N/A</div>;

        return (
          <div className="text-sm">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        const date = row.original.updatedAt;
        if (!date) return <div className="text-sm text-muted-foreground">N/A</div>;

        return (
          <div className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

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
                    href={`/dashboard/users/${user.id}`}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {canUpdate && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/users/${user.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </Link>
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {canDelete && (
              <DeleteUserDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                user={userToDelete}
                onSuccess={() => {
                  setUserToDelete(null);
                }}
              />
            )}
          </>
        );
      },
    },
  ];
};

