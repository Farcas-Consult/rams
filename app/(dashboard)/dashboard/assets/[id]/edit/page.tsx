import { notFound } from "next/navigation";

import { AssetForm } from "../../components/asset-form";
import { getAssetById } from "../../services/asset-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EditAssetPageProps = {
  params: {
    id: string;
  };
};

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const asset = await getAssetById(params.id);

  if (!asset) {
    notFound();
  }

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Asset</h1>
        <p className="text-muted-foreground">
          Update the asset information. Changes will be reflected throughout RAMS immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
          <CardDescription>Edit ownership, lifecycle details, or add internal notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssetForm mode="edit" initialData={asset} />
        </CardContent>
      </Card>
    </div>
  );
}


