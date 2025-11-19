import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssetForm } from "../components/asset-form";

export default function NewAssetPage() {
  return (
    <div className="space-y-6 px-4 pb-10 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Asset</h1>
        <p className="text-muted-foreground">
          Register a new asset in the RAMS inventory. All fields are editable
          later.
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
          <AssetForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
