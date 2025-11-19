"use client";

import { UserForm } from "../../components/user-form";
import { getUserById } from "../../services/user-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setUserId(id);
        
        const userData = await getUserById(id);
        if (!userData) {
          setError("User not found");
          return;
        }

        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          image: userData.image,
          emailVerified: userData.emailVerified,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [params]);

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
      <UserForm mode="edit" initialData={user} userId={userId} />
    </div>
  );
}

