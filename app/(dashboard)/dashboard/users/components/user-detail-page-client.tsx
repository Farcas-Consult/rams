"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconLock,
  IconMail,
  IconShield,
  IconTrash,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { DeleteUserDialog } from "./delete-user-dialog";
import type { UserResponse } from "../schemas/user-schemas";
import { getUserById } from "../services/user-service";

interface UserDetailPageClientProps {
  userId: string;
  canUpdate: boolean;
  canDelete: boolean;
}

export function UserDetailPageClient({
  userId,
  canUpdate,
  canDelete,
}: UserDetailPageClientProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
        if (!userData) {
          setError("User not found");
          return;
        }
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 lg:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <Card className="w-full max-w-2xl mx-auto border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || "User not found"}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/users")}
              className="mt-4"
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25";
      case "inactive":
        return "bg-gray-500/15 text-gray-700 dark:text-gray-400 hover:bg-gray-500/25";
      case "suspended":
        return "bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25";
      case "invited":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25";
      default:
        return "bg-gray-500/15 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/users")}
            className="rounded-full"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage user details and permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconMail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>
              <Badge className={cn("capitalize", getStatusColor(user.status))}>
                {user.status}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconShield className="h-4 w-4" /> Role
                </h3>
                <p className="text-lg font-medium capitalize">{user.role}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconCalendar className="h-4 w-4" /> Joined
                </h3>
                <p className="text-lg font-medium">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconLock className="h-4 w-4" /> Permissions
              </h3>
              {user.permissions && user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="font-normal">
                      {perm}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No specific permissions assigned (inherits from role)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
            <CardDescription>Lifecycle details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">User ID</span>
              <span
                className="font-mono text-xs truncate max-w-[150px]"
                title={user.id}
              >
                {user.id}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Email Verified</span>
              <Badge
                variant={user.emailVerified ? "default" : "secondary"}
                className="text-xs"
              >
                {user.emailVerified ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
            {user.invitedAt && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Invited At</span>
                <span>{new Date(user.invitedAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {canDelete && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={user}
          onSuccess={() => router.push("/dashboard/users")}
        />
      )}
    </div>
  );
}

