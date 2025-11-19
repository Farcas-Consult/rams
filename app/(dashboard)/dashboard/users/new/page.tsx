import Link from "next/link";

import { requireUserWithPermission } from "@/lib/server/authz";
import { ForbiddenError, UnauthorizedError } from "@/lib/server/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserForm } from "../components/user-form";

export default async function NewUserPage() {
  try {
    await requireUserWithPermission("users:create");
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
      return (
        <div className="container mx-auto py-6 px-4 lg:px-6">
          <Card className="w-full max-w-2xl mx-auto border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error.message}</p>
              <Button variant="outline" asChild className="mt-4">
                <Link href="/dashboard/users">Back to Users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    throw error;
  }

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <UserForm mode="create" />
    </div>
  );
}

