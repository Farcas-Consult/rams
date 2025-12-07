"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssetForm } from "../components/asset-form";

export default function NewAssetPage() {
  const searchParams = useSearchParams();
  const epc = searchParams.get("epc");

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Asset</h1>
        <p className="text-muted-foreground">
          Register a new asset in the RAMS inventory. All fields are editable
          later.
          {epc && (
            <span className="block mt-1 text-sm font-medium">
              EPC: <span className="font-mono">{epc}</span>
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
          <CardDescription>
            Provide a short overview to keep your asset registry tidy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssetForm mode="create" epc={epc ?? undefined} />
        </CardContent>
      </Card>
    </div>
  );
}
