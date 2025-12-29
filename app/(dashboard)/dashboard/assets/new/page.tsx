"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconUpload, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function NewAssetPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to assets page after a short delay
    const timer = setTimeout(() => {
      router.push("/dashboard/assets");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manual Asset Creation Disabled</h1>
        <p className="text-muted-foreground">
          Assets can only be created through Excel import.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Creation Policy</CardTitle>
          <CardDescription>
            Manual asset creation has been disabled. Please use the Excel import feature to add new assets to the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To add new assets:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li>Navigate to the Assets page</li>
              <li>Click the &quot;Import Excel&quot; button</li>
              <li>Upload your Excel file with asset data</li>
            </ol>
          </div>
          <div className="flex gap-2 pt-4">
            <Button asChild>
              <Link href="/dashboard/assets">
                <IconArrowLeft className="mr-2 size-4" />
                Go to Assets
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/assets">
                <IconUpload className="mr-2 size-4" />
                Import Excel
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            You will be redirected to the Assets page in a few seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
