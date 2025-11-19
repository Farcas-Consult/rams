"use client";

import { UserForm } from "../../components/user-form";
import { getUserById } from "../../services/user-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { UserResponse } from "../../schemas/user-schemas";

interface EditUserPageProps {
  params: { id: string };
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(params.id);
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
  }, [params.id]);

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
    return (
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">Error</h1>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error || "User not found"}</p>
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

