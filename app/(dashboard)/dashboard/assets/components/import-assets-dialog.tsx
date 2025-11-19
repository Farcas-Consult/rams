"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImportAssets } from "../hooks/useAssetMutations";
import { CreateAssetInput } from "../schemas/asset-schemas";
import { IconLoader, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";

interface ImportAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Excel column mapping - adjust these based on your actual Excel structure
 * The keys are the Excel column headers, values are the asset property names
 */
const EXCEL_COLUMN_MAPPING: Record<string, keyof CreateAssetInput> = {
  "Asset Tag": "assetTag",
  "Asset Name": "assetName",
  "Name": "assetName",
  "Category": "category",
  "Location": "location",
  "Status": "status",
  "Assigned To": "assignedTo",
  "Purchase Date": "purchaseDate",
  "Purchase Price": "purchasePrice",
  "Price": "purchasePrice",
  "Serial Number": "serialNumber",
  "Serial": "serialNumber",
  "Manufacturer": "manufacturer",
  "Model": "model",
  "Description": "description",
};

export function ImportAssetsDialog({
  open,
  onOpenChange,
}: ImportAssetsDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<CreateAssetInput[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { mutateAsync: importAssets, isPending } = useImportAssets();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast.error("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    processExcelFile(selectedFile);
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

      if (jsonData.length < 2) {
        toast.error("Excel file must have at least a header row and one data row");
        setIsProcessing(false);
        return;
      }

      // First row is headers
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      // Map Excel columns to asset properties
      const mappedAssets: CreateAssetInput[] = dataRows
        .filter((row) => row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== ""))
        .map((row) => {
          const asset: any = {};

          headers.forEach((header, index) => {
            const normalizedHeader = header?.trim();
            const mappedKey = EXCEL_COLUMN_MAPPING[normalizedHeader];

            if (mappedKey && row[index] !== undefined && row[index] !== null && row[index] !== "") {
              const value = row[index];

              // Handle different data types
              if (mappedKey === "purchasePrice") {
                asset[mappedKey] = typeof value === "number" ? value : parseFloat(value) || undefined;
              } else if (mappedKey === "purchaseDate") {
                // Handle Excel date serial numbers or date strings
                if (typeof value === "number") {
                  // Excel date serial number
                  const excelEpoch = new Date(1899, 11, 30);
                  const date = new Date(excelEpoch.getTime() + value * 86400000);
                  asset[mappedKey] = date.toISOString().split("T")[0];
                } else {
                  asset[mappedKey] = value;
                }
              } else {
                asset[mappedKey] = String(value).trim();
              }
            }
          });

          // Ensure assetName is required
          if (!asset.assetName) {
            asset.assetName = asset.assetTag || `Imported Asset ${Date.now()}`;
          }

          return asset as CreateAssetInput;
        });

      setPreview(mappedAssets);

      if (mappedAssets.length === 0) {
        toast.error("No valid data found in Excel file");
      } else {
        toast.success(`Found ${mappedAssets.length} assets to import`);
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process Excel file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast.error("No assets to import");
      return;
    }

    try {
      await importAssets({ assets: preview });
      onOpenChange(false);
      setFile(null);
      setPreview([]);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Import error:", error);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Assets from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) to import assets. The first row should contain column headers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing || isPending}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: .xlsx, .xls
            </p>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconLoader className="h-4 w-4 animate-spin" />
              Processing file...
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({preview.length} assets found)</Label>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Asset Name</th>
                      <th className="px-2 py-1 text-left">Tag</th>
                      <th className="px-2 py-1 text-left">Category</th>
                      <th className="px-2 py-1 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((asset, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-2 py-1">{asset.assetName}</td>
                        <td className="px-2 py-1">{asset.assetTag || "N/A"}</td>
                        <td className="px-2 py-1">{asset.category || "N/A"}</td>
                        <td className="px-2 py-1">{asset.status || "N/A"}</td>
                      </tr>
                    ))}
                    {preview.length > 10 && (
                      <tr>
                        <td colSpan={4} className="px-2 py-1 text-center text-muted-foreground">
                          ... and {preview.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Expected Excel columns:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Asset Name (required) or Name</li>
              <li>Asset Tag (optional)</li>
              <li>Category, Location, Status (optional)</li>
              <li>Purchase Date, Purchase Price (optional)</li>
              <li>Serial Number, Manufacturer, Model (optional)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={preview.length === 0 || isPending || isProcessing}
          >
            {isPending ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <IconUpload className="mr-2 h-4 w-4" />
                Import {preview.length} Assets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

