"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UserForm } from "./user-form";
import { useUser } from "../hooks/useUsers";

interface EditUserPageClientProps {
  userId: string;
}

export function EditUserPageClient({ userId }: EditUserPageClientProps) {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : error
          ? String(error)
          : "User not found";

    return (
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">Error</h1>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{errorMessage}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/users")}
              className="mt-4"
            >
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <UserForm mode="edit" initialData={user} />
    </div>
  );
}

